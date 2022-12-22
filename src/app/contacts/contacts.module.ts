import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '../shared/shared.module';
import { ContactsComponent } from './contacts.component';
import { DetailsComponent } from './contact/details/details.component';
import { EditComponent } from './contact/edit/edit.component';
import { ListComponent } from './list/list.component';
import { HeaderComponent } from './header/header.component';
import { DetailDatePipe } from './contact/details/detail-date.pipe';
import { DateSelectorComponent } from './contact/edit/date-selector/date-selector.component';
import { ContactComponent } from './contact/contact.component';

@NgModule({
  imports: [CommonModule, SharedModule, FormsModule],
  declarations: [
    ContactComponent,
    ContactsComponent,
    DetailsComponent,
    EditComponent,
    HeaderComponent,
    ListComponent,
    DetailDatePipe,
    DateSelectorComponent
  ],
  exports: [ContactsComponent]
})
export class ContactsModule {}
