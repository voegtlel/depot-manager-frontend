import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ApiService } from 'src/app/_services';
import { Observable, BehaviorSubject } from 'rxjs';
import { Picture } from 'src/app/_models';
import { shareReplay, switchMap } from 'rxjs/operators';
import { NgxFileDropEntry, FileSystemFileEntry } from 'ngx-file-drop';

@Component({
    selector: 'depot-picture-list',
    templateUrl: './picture-list.component.html',
    styleUrls: ['./picture-list.component.scss'],
})
export class PictureListComponent implements OnInit {
    pictures$: Observable<Picture[]>;
    reload$ = new BehaviorSubject<void>(undefined);

    @Output() public selectPicture = new EventEmitter<string>();

    constructor(private api: ApiService) {}

    ngOnInit() {
        this.pictures$ = this.reload$.pipe(
            switchMap(() => this.api.getPictures()),
            shareReplay(1)
        );
    }

    getPictureUrl(picture: Picture): string {
        return this.api.getPicturePreviewUrl(picture.id);
    }

    onFileDrop(files: NgxFileDropEntry[]) {
        for (const droppedFile of files) {
            // Is it a file?
            if (droppedFile.fileEntry.isFile) {
                const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
                fileEntry.file((file: File) => {
                    this.api.createPicture(file).subscribe(pictureId => {
                        console.log('Created picture', pictureId);
                        this.reload$.next();
                    });
                });
            }
        }
    }
}
