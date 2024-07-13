import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-book-add-edit',
  templateUrl: './book-add-edit.component.html',
  styleUrl: './book-add-edit.component.scss'
})
export class BookAddEditComponent {
  bookForm : FormGroup;

  constructor(private _fb : FormBuilder, private _bookservice : BookService, private _dialogrRef: MatDialogRef<BookAddEditComponent>){
    this.bookForm = this._fb.group({
      title: '',
      author: '',
      isbn: '',
      genre: '',
      datePublication: '',
      editeur: '',
      langue: '',
      description: '',
      nbPage: '',
      prix: ''
    })
  }

  onFormSubmit(){
    if(this.bookForm.valid){
      //console.log(this.bookForm.value)
      this._bookservice.addBook(this.bookForm.value).subscribe({
        next: (val: any) => {
            alert('Book added successfully! ');
            this._dialogrRef.close(true);
        },
        error: (err: any) => {
          console.error(err);
        }
        
      })
      
    }
  }
}

