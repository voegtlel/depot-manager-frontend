import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import {
    ApiService,
    AuthService,
    ItemsService,
    ReportProfileWithElements,
    ReportService,
} from '../../../common-module/_services';
import { BehaviorSubject, Observable, of, Subject, combineLatest } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import {
    Item,
    ItemCondition,
    ReportElement,
    ReportItemInWrite,
    TotalReportState,
} from '../../../common-module/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';
import { distinctUntilChanged, map, shareReplay, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Choice } from '../../../common-module/components/form-element/form-element.component';

class ReportElementFormGroup extends FormGroup {
    constructor(public readonly reportElement: ReportElement) {
        super({
            reportElementId: new FormControl(reportElement.id),
            state: new FormControl(null),
            comment: new FormControl(null),
        });
    }
}

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

    conditionTranslation: Record<ItemCondition, [string, string]> = {
        good: ['Good', 'success'],
        ok: ['Ok', 'success'],
        bad: ['Bad', 'warning'],
        gone: ['Unavailable', 'danger'],
    };

    conditionChoices: Choice<ItemCondition>[] = [
        ItemCondition.Good,
        ItemCondition.Ok,
        ItemCondition.Bad,
        ItemCondition.Gone,
    ].map((value) => {
        return {
            value,
            title: this.conditionTranslation[value][0],
            status: this.conditionTranslation[value][1],
        };
    });

    createReport = false;

    groupItem = new FormControl(false);

    reportProfile$: Observable<ReportProfileWithElements>;

    readonly reportForm: FormArray = new FormArray([]);
    readonly form: FormGroup = new FormGroup({
        externalId: new FormControl(''),
        manufacturer: new FormControl(''),
        model: new FormControl(''),
        serialNumber: new FormControl(''),
        manufactureDate: new FormControl(null),
        purchaseDate: new FormControl(null),
        firstUseDate: new FormControl(null),
        name: new FormControl('', Validators.required),
        description: new FormControl('', Validators.required),
        reportProfileId: new FormControl(null),
        condition: new FormControl(null, Validators.required),
        conditionComment: new FormControl(''),
        pictureId: new FormControl(null),
        groupId: new FormControl(null),
        bayId: new FormControl(null),
        tags: new FormControl([]),
        changeComment: new FormControl(''),
    } as Record<keyof ReportItemInWrite, FormControl | FormArray>);

    constructor(
        public api: ApiService,
        public authService: AuthService,
        public activatedRoute: ActivatedRoute,
        public router: Router,
        private toastrService: NbToastrService,
        private dialogService: NbDialogService,
        private itemsService: ItemsService,
        private reportService: ReportService
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

        combineLatest([loadedItem$, this.authService.isManager$])
            .pipe(takeUntil(this.destroyed$))
            .subscribe(([item, isManager]) => {
                if (item !== null) {
                    this.itemId = item.id;
                    this.isNew = false;
                    this.form.reset(item);
                    this.groupItem.reset(!!item.groupId);
                } else {
                    this.createReport = true;
                    this.itemId = null;
                    this.isNew = true;
                    this.reportForm.clear();
                    this.form.reset({
                        externalId: '',

                        manufacturer: '',
                        model: '',
                        serialNumber: '',
                        manufactureDate: null,
                        purchaseDate: null,
                        firstUseDate: null,

                        name: '',
                        description: '',
                        reportProfileId: null,

                        condition: null,
                        conditionComment: '',

                        pictureId: null,

                        groupId: null,

                        bayId: null,

                        tags: [],

                        changeComment: '',

                        lastService: null,
                        totalReportState: null,
                        report: [],
                    } as ReportItemInWrite);
                }
                if (isManager) {
                    this.form.enable();
                } else {
                    this.form.disable();
                }
                this.submitted = false;
                this.loading = false;
            });
        this.reportProfile$ = this.form.controls.reportProfileId.valueChanges.pipe(
            startWith(this.form.controls.reportProfileId.value),
            distinctUntilChanged(),
            switchMap((reportProfileId) =>
                this.reportService.profilesByIdWithElements$.pipe(map((byId) => byId[reportProfileId]))
            )
        );

        this.reportProfile$.pipe(takeUntil(this.destroyed$)).subscribe((reportProfile) => {
            this.reportForm.clear();
            if (reportProfile != null) {
                for (const element of reportProfile.elements) {
                    const elementForm = new ReportElementFormGroup(element);
                    this.reportForm.push(elementForm);
                }
            }
        });

        this.itemsService.items$.pipe(takeUntil(this.destroyed$)).subscribe(() => {});
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
    }

    initReport() {
        const profileId = this.form.controls.reportProfileId.value;
        if (profileId == null) {
            return;
        }
        this.form.addControl('lastService', new FormControl(new Date().toISOString().substring(0, 10)));
        this.form.addControl('totalReportState', new FormControl(null, Validators.required));
        this.form.addControl('report', this.reportForm);
        this.form.updateValueAndValidity();
        this.createReport = true;
    }

    uninitReport() {
        this.form.removeControl('lastService');
        this.form.removeControl('totalReportState');
        this.form.removeControl('report');
        this.form.updateValueAndValidity();
        this.createReport = false;
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

    openItemDialog($event: MouseEvent, dialog: TemplateRef<any>) {
        $event.preventDefault();
        $event.stopPropagation();
        this.dialogService.open(dialog, {
            hasBackdrop: true,
            closeOnBackdropClick: false,
            hasScroll: false,
            autoFocus: true,
            context: {
                id: this.itemId,
                ...this.form.value,
            },
        });
    }

    onSubmit(dialogRef: NbDialogRef<any>) {
        console.log('Submit:', this.form.getRawValue());
        this.submitted = true;
        if (!this.form.valid) {
            return;
        }
        let apiCall: Observable<Item>;
        const rawValue = this.form.getRawValue();
        if (!this.createReport) {
            delete rawValue.lastService;
            delete rawValue.totalReportState;
            delete rawValue.report;
        }
        if (this.isNew) {
            delete rawValue.comment;
            apiCall = this.api.createItem(rawValue);
        } else if (this.createReport) {
            apiCall = this.api.reportItem(this.itemId, rawValue);
        } else {
            apiCall = this.api.saveItem(this.itemId, rawValue);
        }
        apiCall.subscribe(
            (item) => {
                console.log('Saved', item);
                this.uninitReport();
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
