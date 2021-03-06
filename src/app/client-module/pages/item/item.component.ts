import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ApiService, AuthService, ItemsService } from '../../../common-module/_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Item, ItemCondition, ItemWithComment } from '../../../common-module/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Choice } from '../../../common-module/components/form-element/form-element.component';

@Component({
    selector: 'depot-item',
    templateUrl: './item.component.html',
    styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    isNew: boolean;

    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);

    itemId: string = null;

    conditionTranslation: Record<ItemCondition, string> = {
        good: 'Good',
        ok: 'Ok',
        bad: 'Bad',
        gone: 'Gone',
    };

    conditionChoices: Choice<ItemCondition>[] = [
        ItemCondition.Good,
        ItemCondition.Ok,
        ItemCondition.Bad,
        ItemCondition.Gone,
    ].map((value) => {
        return {
            value,
            title: this.conditionTranslation[value],
        };
    });

    groupItem = new FormControl(false);

    readonly form: FormGroup = new FormGroup({
        externalId: new FormControl(''),
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        condition: new FormControl(null, Validators.required),
        conditionComment: new FormControl(''),
        purchaseDate: new FormControl(null),
        lastService: new FormControl(null),
        pictureId: new FormControl(null),
        groupId: new FormControl(null),
        bayId: new FormControl(null),
        tags: new FormControl([]),
        changeComment: new FormControl(''),
    } as Record<keyof ItemWithComment, FormControl>);

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService,
        private dialogService: NbDialogService,
        private itemsService: ItemsService
    ) {}

    ngOnInit() {
        const itemId$ = this.activatedRoute.paramMap.pipe(map((params) => params.get('itemId')));
        const loadedItem$ = this.reload$.pipe(
            switchMap(() => itemId$),
            switchMap((itemId) => {
                if (itemId && itemId !== 'new') {
                    return this.api.getItem(itemId);
                }
                return of(null);
            }),
            shareReplay(1),
            takeUntil(this.destroyed$)
        );

        combineLatest([loadedItem$, this.authService.user$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([item, user]) => {
                if (item !== null) {
                    this.itemId = item.id;
                    this.isNew = false;
                    this.form.reset(item);
                    this.groupItem.reset(!!item.groupId);
                } else {
                    this.itemId = null;
                    this.isNew = true;
                    this.form.reset({
                        externalId: '',
                        name: '',
                        description: '',

                        condition: null,
                        conditionComment: '',

                        purchaseDate: null,
                        lastService: null,

                        pictureId: null,

                        groupId: null,

                        bayId: null,

                        tags: [],

                        changeComment: '',
                    } as ItemWithComment);
                }
                if (user.groups.includes('admin')) {
                    this.form.enable();
                } else {
                    this.form.disable();
                }
                this.submitted = false;
                this.loading = false;
            });

        this.itemsService.items$.pipe(takeUntil(this.destroyed$)).subscribe(() => {});
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    openConfirmDialog($event: MouseEvent, dialog: TemplateRef<any>) {
        $event.preventDefault();
        $event.stopPropagation();
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        if (this.isNew) {
            this.onSubmit(null);
        } else {
            this.dialogService.open(dialog, {
                hasBackdrop: true,
                closeOnBackdropClick: false,
                hasScroll: false,
                autoFocus: true,
            });
        }
    }

    onSubmit(dialogRef: NbDialogRef<any>) {
        console.log('Submit:', this.form.getRawValue());
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Item>;
        if (this.isNew) {
            const rawValue = this.form.getRawValue();
            delete rawValue.comment;
            apiCall = this.api.createItem(rawValue);
        } else {
            apiCall = this.api.saveItem(this.itemId, this.form.getRawValue());
        }
        apiCall.subscribe(
            (item) => {
                console.log('Saved', item);
                this.form.reset(item);
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.router.navigate(['..', item.id], {
                    replaceUrl: true,
                    relativeTo: this.activatedRoute,
                });
                this.toastrService.success('Item was saved', 'Item Saved');
                if (dialogRef) {
                    dialogRef.close();
                }
                this.itemsService.reload();
            },
            (error) => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
