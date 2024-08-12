import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreService } from '../../services/core.service';
import { Author } from '../../../models/author.model';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrl: './book-add-edit.component.scss'
})
export class BookAddEditComponent implements OnInit{
  book: any;
  authorName: string = "";
  bookForm : FormGroup;
  authors: Author[] = [];
  filteredAuthorsNames: Observable<string[]> | undefined;
  authorsNames: string[] = [];

  constructor(private _fb : FormBuilder,
    private _bookservice : BookService,
    private _dialogRef: MatDialogRef<BookAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
    
  ){
    this.book = data.book;
    this.authorName = data.authorName;
    this.authors = data.authors;
    this.authorsNames = this.authors.map(author => author.name);
    
    this.bookForm = this._fb.group({
      title: [''],
      author: [''],
      isbn: [''],
      genre: [''],
      datePublication: [''],
      editeur: [''],
      langue: [''],
      description: [''],
      nb_Page: [0],
      prix: [0]
    })
  }

  ngOnInit(): void {
    if (this.book){
      this.bookForm.patchValue({
        title: this.book.title || '',
        author: this.authorName || '',
        isbn: this.book.isbn || '',
        genre: this.book.genre || '',
        datePublication: this.book.datePublication || '',
        editeur: this.book.editeur || '',
        langue: this.book.langue || '',
        description: this.book.description || '',
        nb_Page: this.book.nb_Page || '',
        prix: this.book.prix || ''
      });
    };
    this.filteredAuthorsNames = this.bookForm.controls['author'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.authorsNames.filter(option => option.toLowerCase().includes(filterValue));
  }

  onFormSubmit() {
    if (this.bookForm.valid) {
      const formData = this.bookForm.value;

      if (this.book) {

        formData.id_Auth = this.book.id_Auth; // Add the id_Auth property


        if (this.book.isbn === formData.isbn) {

          /*             =====>ISBN has not changed, proceed with the update<=====               */

          //adding the Author Id to the data        
          this._bookservice.updateBook(this.book.id, formData, formData.author )
          .subscribe({
            next: (val: any) => {
              this._coreService.openSnackBar('Book updated successfully!');
              this._dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            }
          });
        } else {

          /*             =====>ISBN has changed, check if the new ISBN already exists<=====               */
          
          this._bookservice.checkIsbnExists(formData.isbn).subscribe({
            next: (isbnExists: boolean) => {
              if (isbnExists) {
                this._coreService.openSnackBar('ISBN already exists!');
              }else {
                this._bookservice.updateBook(this.book.id, formData, formData.author).subscribe({
                  next: (val: any) => {
                    this._coreService.openSnackBar('Book updated successfully!');
                    this._dialogRef.close(true);
                  },
                  error: (err: any) => {
                    console.error(err);
                  }
                });
              }
            },
          });
        }
      } else {
        // If adding a new book, always check if the ISBN already exists
        const formData = this.bookForm.value;
        this._bookservice.checkIsbnExists(formData.isbn).subscribe({
          next: (isbnExists: boolean) => {
            if (isbnExists) {
              this._coreService.openSnackBar('ISBN already exists!');
            } else {
              this._bookservice.addBook(formData, formData.author).subscribe({
                next: (val: any) => {
                  this._coreService.openSnackBar('Book added successfully!');
                  this._dialogRef.close(true);

                },
                error: (err: any) => {
                  console.error(err);
                }
              });
            }
          },
          error: (err: any) => {
            console.error(err);
          }
        });
      }
    }
  }
   

}
