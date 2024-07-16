import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrl: './book-add-edit.component.scss'
})
export class BookAddEditComponent implements OnInit{
  bookForm : FormGroup;

  constructor(private _fb : FormBuilder,
    private _bookservice : BookService,
    private _dialogRef: MatDialogRef<BookAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _coreService: CoreService
    
  ){
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
      this.bookForm.patchValue(this.data)
  }

  onFormSubmit() {
    if (this.bookForm.valid) {
      const formData = this.bookForm.value;
      formData.datePublication = new Date(formData.datePublication);
  
      if (this.data) {
        // If updating an existing book, compare the original ISBN with the new ISBN
        if (this.data.isbn === formData.isbn) {
          // ISBN has not changed, proceed with the update
          this._bookservice.updateBook(this.data.id, formData).subscribe({
            next: (val: any) => {
              this._coreService.openSnackBar('Book updated successfully!');
              this._dialogRef.close(true);
            },
            error: (err: any) => {
              console.error(err);
            }
          });
        } else {
          // ISBN has changed, check if the new ISBN already exists
          this._bookservice.checkIsbnExists(formData.isbn).subscribe({
            next: (isbnExists: boolean) => {
              if (isbnExists) {
                this._coreService.openSnackBar('ISBN already exists!');
              } else {
                this._bookservice.updateBook(this.data.id, formData).subscribe({
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
            error: (err: any) => {
              console.error(err);
            }
          });
        }
      } else {
        // If adding a new book, always check if the ISBN already exists
        this._bookservice.checkIsbnExists(formData.isbn).subscribe({
          next: (isbnExists: boolean) => {
            if (isbnExists) {
              this._coreService.openSnackBar('ISBN already exists!');
            } else {
              this._bookservice.addBook(formData).subscribe({
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
