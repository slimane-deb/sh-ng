import { Component, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../services';
import { UserPanelModule } from '../user-panel/user-panel.component';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import {DxMenuModule} from "devextreme-angular";
import {Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: 'header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent {

  @Input()
  title: string;
  @Input()
  menuToggleEnabled = false;

  @Output()
  menuToggle = new EventEmitter<boolean>();
  @Output()
  checkIfOpensLeftMenu = new EventEmitter<Number>();
  @Output()
  openPopup = new EventEmitter<any>();
  @Output()
  navigateComponent = new EventEmitter<Object>();

  userMenuItems = [
    {
      text: 'Home',
      icon: 'home',
      onClick: () => {
        this.router.navigate(['/home']);
      }
    },
    {
    text: 'Profile',
    icon: 'user',
    onClick: () => {
        this.router.navigate(['/profile']);
      }
  },
    {
    text: 'Logout',
    icon: 'runner',
    onClick: () => {
      this.authService.logOut();
    }
  }];
  topLeftMenu = [];
  topRightMenu = [];

  showSubmenuModes: any;
  showFirstSubmenuModes: any;
  showFirstBigSubmenuModes: any;

  constructor(private router: Router, private authService: AuthService) {
    this.showSubmenuModes = [{
      name: 'onHover',
      delay: { show: 0, hide: 500 }
    }, {
      name: 'onClick',
      delay: { show: 0, hide: 300 }
    }];
    this.showFirstBigSubmenuModes = this.showSubmenuModes[0];
    this.showFirstSubmenuModes = this.showSubmenuModes[1];
  }
  menuItemClicked(event) {
    if (event.itemData.path) {
      const dataComp = {item : event.itemData, parent : !!event.itemData.menuParentId};
      this.navigateComponent.emit(dataComp);
    } else {
        this.checkIfOpensLeftMenu.emit(event.itemData.menuId);
    }
  }
  popupMenuClick(event){
    if (event.itemData.path === 'defaultPopup'){
      this.openPopup.emit(event.itemData);
    }
  }
  toggleMenu = () => {
    this.menuToggle.emit();
  }
  setMenu(menuL: any[], menuR: any[]) {
    this.topLeftMenu = [...menuL];
    this.topRightMenu = [...menuR];

  }
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    DxToolbarModule,
    DxMenuModule
  ],
  declarations: [ HeaderComponent ],
  exports: [ HeaderComponent ]
})
export class HeaderModule { }
