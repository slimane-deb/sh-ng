import {Component, OnInit, NgModule, Input, ViewChild, OnDestroy, HostListener} from '@angular/core';
import {SideNavigationMenuModule, HeaderModule, HeaderComponent} from '../../shared/components';
import { ScreenService } from '../../shared/services';
import { DxDrawerModule } from 'devextreme-angular/ui/drawer';
import { DxScrollViewModule, DxScrollViewComponent } from 'devextreme-angular/ui/scroll-view';
import { CommonModule } from '@angular/common';

import { Router, NavigationEnd } from '@angular/router';
import {MenuService} from '../../common/services/menu.service';
import {MenuType} from '../../common/types/menu-type';
import {StorageService} from '../../shared/services/storage.service';
import {NAV_STATE, NAV_STATE_CLICK} from '../../shared/storageItems';
import {DailyDrillingModule} from '../../core/daily-drilling/daily-drilling.module';

@Component({
  selector: 'app-side-nav-outer-toolbar',
  templateUrl: './side-nav-outer-toolbar.component.html',
  styleUrls: ['./side-nav-outer-toolbar.component.scss']
})
export class SideNavOuterToolbarComponent implements OnInit, OnDestroy {
  @ViewChild(DxScrollViewComponent, { static: true }) scrollView: DxScrollViewComponent;
  selectedRoute = '';
  @ViewChild('AppHeader', {static: true})
  header: HeaderComponent;
  @Input()
  title: string;

  menuOpened: boolean;
  temporaryMenuOpened = false;
  openedTop;



  menuMode = 'shrink';
  menuRevealMode = 'expand';
  minMenuSize = 0;
  shaderEnabled = false;

  menuItems = [];
  topLeft: any[] = [];
  topRight: any[] = [];
  left: any[] = [];
  allMenus: any[] = [];
  popupVisible = false;

  constructor(private screen: ScreenService, private menuService: MenuService, private storageService: StorageService,
              private router: Router) { }

  ngOnInit() {
    // this.menuOpened = this.screen.sizes['screen-large'];
    this.menuOpened = this.storageService.getSessionStorageItem(NAV_STATE) ? this.storageService.getSessionStorageItem(NAV_STATE) : false;
    this.openedTop = this.storageService.getSessionStorageItem(NAV_STATE_CLICK) ?
      this.storageService.getSessionStorageItem(NAV_STATE_CLICK) : 1;

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.selectedRoute = val.urlAfterRedirects.split('?')[0];
      }
    });

    this.menuService.getListMenu().subscribe(
      response => {
        this.fillMenuItems(response);
      }
      ,
      error => {
        console.log(error);
      }
    );
    this.screen.changed.subscribe(() => this.updateDrawer());

    this.updateDrawer();
  }

  fillMenuItems(menus) {

    this.allMenus = [...menus];
    for (let i of menus) {
      switch (i.menuType) {
        case MenuType.TOP_LEFT:
          this.topLeft.push(i);
          break;
        case MenuType.TOP_RIGHT:
          this.topRight.push(i);
          break;
        case MenuType.LEFT:
          this.left.push(i);
          break;

      }
    }
    this.sortMenu(this.topRight);
    this.sortMenu(this.topLeft);
    this.sortMenu(this.left);

    // Header Main Menu
    this.header.setMenu(this.topLeft, this.topRight);
    // Main Left Menu Items to be Shown
    this.menuItems = [...this.left.filter(elmt => elmt.menuParentId == this.openedTop && elmt.menuType === MenuType.LEFT)];
  }
  private sortMenu(menu) {
    menu.forEach(elmt => {
      if (elmt.items !== undefined) {
        elmt.items.sort((a, b) => a.position - b.position);
      }
    });
    menu.sort((a, b) => a.position - b.position);
  }
  // check left elements on top menu click
  checkLeftMenu(id) {
    this.openedTop = id;
    let newLeftTable = [];
    newLeftTable = this.left.filter(elmt => elmt.menuParentId === id && elmt.menuType === MenuType.LEFT);
    this.menuItems = [...newLeftTable];
    if (newLeftTable.length > 0) {
      if (!this.menuOpened) { this.menuOpened = !this.menuOpened; }
      if (this.minMenuSize === 0 && !this.screen.sizes['screen-x-small']) { this.minMenuSize = 60; }
    } else { this.minMenuSize = 0; }
  }
  navigationToOtherComponent(menuItem: any) {
/*    let idToTestWith = menuItem.item.menuParentId;
    if (menuItem.parent) {
      const element = this.allMenus.find(elmt => elmt.id === menuItem.item.menuParentId);
      if (element) { idToTestWith = element.menuParentId; }
    }
    if (this.menuItems[0].menuParentId !== idToTestWith) {
      const newLeftTable = this.left;
      if (newLeftTable.length > 0) {
        this.menuItems = [...newLeftTable];
      }
    }*/
    this.router.navigate([menuItem.item.path]);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunloadHandler(event) {
    this.storageService.setSessionStorageItem(NAV_STATE, this.menuOpened);
    this.storageService.setSessionStorageItem(NAV_STATE_CLICK, this.openedTop);
  }
  updateDrawer() {
    const isXSmall = this.screen.sizes['screen-x-small'];
    const isLarge = this.screen.sizes['screen-large'];

    this.menuMode = isLarge ? 'shrink' : 'overlap';
    this.menuRevealMode = isXSmall ? 'slide' : 'expand';
    this.minMenuSize = isXSmall ? 0 : 60;
    this.shaderEnabled = !isLarge;
  }

  get hideMenuAfterNavigation() {
    return this.menuMode === 'overlap' || this.temporaryMenuOpened;
  }

  get showMenuAfterClick() {
    return !this.menuOpened;
  }

  navigationChanged(event) {
    const path = event.itemData.path;
    const pointerEvent = event.event;

    if (path && this.menuOpened) {
      if (event.node.selected) {
        pointerEvent.preventDefault();
      } else {
        this.router.navigate([path]);
        this.scrollView.instance.scrollTo(0);
      }

      if (this.hideMenuAfterNavigation) {
        this.temporaryMenuOpened = false;
        this.menuOpened = false;
        pointerEvent.stopPropagation();
      }
    } else {
      pointerEvent.preventDefault();
    }
  }

  navigationClick() {
    if (this.showMenuAfterClick) {
      this.temporaryMenuOpened = true;
      this.menuOpened = true;
    }
  }
  ngOnDestroy(){
    // localStorage.setItem('lastSelMenu', JSON.stringify(this.menuItems));
  }

  togglePopup(data: any) {
    console.log(data);
    this.popupVisible = !this.popupVisible;
  }
}

@NgModule({
  imports: [SideNavigationMenuModule, DxDrawerModule, HeaderModule, DxScrollViewModule, CommonModule, DailyDrillingModule],
  exports: [ SideNavOuterToolbarComponent ],
  declarations: [ SideNavOuterToolbarComponent ]
})
export class SideNavOuterToolbarModule { }
