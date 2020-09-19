import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeafletPageRoutingModule } from './leaflet-routing.module';

import { LeafletPage } from './leaflet.page';
import {BottomSheetComponent, BottomSheetModule} from 'ionic-custom-bottom-sheet';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {SearchCompComponent} from './search-comp/search-comp.component';
import {NgZorroAntdModule} from 'ng-zorro-antd';

@NgModule({
  entryComponents: [ SearchCompComponent],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        LeafletPageRoutingModule,
        MatInputModule,
        MatAutocompleteModule,
        MatIconModule,
        MatButtonModule,
        NgZorroAntdModule
    ],
  declarations: [LeafletPage, SearchCompComponent]
})
export class LeafletPageModule {}
