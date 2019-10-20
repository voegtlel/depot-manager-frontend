import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ApiService, AuthService } from '../../_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Item } from '../../_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbDialogService } from '@nebular/theme';
import { map, shareReplay, switchMap, takeUntil } from 'rxjs/operators';
import { Choice } from '../form-element/form-element.component';

@Component({
    selector: 'depot-item',
    templateUrl: './item.component.html',
})
export class ItemComponent implements OnInit, OnDestroy {
    private destroyed$ = new Subject<void>();

    loading: boolean;
    submitted: boolean;

    isNew: boolean;

    reload$: BehaviorSubject<void> = new BehaviorSubject(undefined);

    teams$: Observable<{ value: string; title: string }[]>;

    itemId: string = null;

    conditionTranslation: Record<number, string> = {
        1: 'Good',
        2: 'Ok',
        3: 'Bad',
        4: 'Gone',
    };

    conditionChoices: Choice<number>[] = [1, 2, 3, 4].map(value => {
        return {
            value,
            title: this.conditionTranslation[value],
        };
    });

    readonly form: FormGroup = new FormGroup({
        externalId: new FormControl(''),
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        condition: new FormControl(null, Validators.required),
        conditionComment: new FormControl(''),
        purchaseDate: new FormControl(null),
        lastService: new FormControl(null),
        pictureId: new FormControl(null),
        tags: new FormControl([]),
    });

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService,
        private dialogService: NbDialogService
    ) {}

    ngOnInit() {
        const itemId$ = this.activatedRoute.paramMap.pipe(map(params => params.get('itemId')));
        const loadedItem$ = this.reload$.pipe(
            switchMap(() => itemId$),
            switchMap(itemId => {
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

                        tags: [],
                    });
                }
                if (user.groups.includes('admin')) {
                    this.form.enable();
                } else {
                    this.form.disable();
                }
                this.submitted = false;
                this.loading = false;
            });
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
        this.dialogService.open(dialog, {
            hasBackdrop: true,
            closeOnBackdropClick: false,
            hasScroll: false,
            autoFocus: true,
            context: { comment: new FormControl('') },
        });
    }

    onSubmit(comment: string) {
        console.log('Submit:', comment, this.form.getRawValue());
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Item>;
        if (this.isNew) {
            apiCall = this.api.createItem(this.form.getRawValue());
        } else {
            apiCall = this.api.saveItem(this.itemId, { comment, ...this.form.getRawValue() });
        }
        apiCall.subscribe(
            item => {
                console.log('Saved', item);
                this.form.reset(item);
                this.form.markAsPristine();
                this.form.markAsUntouched();
                this.router.navigate(['..', item.id], {
                    replaceUrl: true,
                    relativeTo: this.activatedRoute,
                });
                this.toastrService.success('Item was saved', 'Item Saved');
            },
            error => {
                console.log(error);
                this.toastrService.danger(error, 'Failed');
            }
        );
    }
}
