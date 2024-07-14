import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrl: './book-add-edit.component.scss'
})
export class BookAddEditComponent implements OnInit{
  bookForm : FormGroup;

  constructor(private _fb : FormBuilder, private _bookservice : BookService, private _dialogrRef: MatDialogRef<BookAddEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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

  onFormSubmit(){
    if(this.bookForm.valid){
      if(this.data){
        //convert string to date !!
        const formData = this.bookForm.value;
        formData.datePublication = new Date(formData.datePublication);

        this._bookservice.updateBook(this.data.id, this.bookForm.value).subscribe({
          next: (val: any) => {
              alert('Book updated!');
              this._dialogrRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          }
        })
      }else{
        this._bookservice.addBook(this.bookForm.value).subscribe({
          next: (val: any) => {
              alert('Book added successfully!');
              this._dialogrRef.close(true);
          },
          error: (err: any) => {
            console.error(err);
          }  
        })
      }
    }
  }
}
