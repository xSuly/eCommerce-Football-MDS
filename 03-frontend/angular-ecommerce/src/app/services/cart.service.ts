import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  // storage: Storage = sessionStorage;
  storage: Storage = localStorage;

  constructor() {

    // read data from storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);

    if(data != null) {
      this.cartItems = data;

      // compute totals based on the data that is read from storage
      this.computeCartTotals();
    }

   }

  addToCart(theCartItem: CartItem) {

    // check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      // find the item in the cart using item id

      // returns the first element that passes the test, else returns undefined
      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id); 
      
      // check if we found it
      alreadyExistsInCart = (existingCartItem != undefined);
    }

    if (alreadyExistsInCart) {
      // increment the quantity
      existingCartItem.quantity++;
    }
    else {
      // push the cart item to the array
      this.cartItems.push(theCartItem);
    }

    // compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {
    
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for(let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice;
      totalQuantityValue += currentCartItem.quantity;
    }

    // publish the new values | subscribers will receive the data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    this.logCartData(totalPriceValue, totalQuantityValue)

    // persist the cart data
    this.persistCartItems();
  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  
  logCartData(totalPriceValue: number, totalQuantityValue: number) {

      console.log(`Contents of the cart`);
      for(let tempCartItem of this.cartItems) {
        const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
        console.log(`name: ${tempCartItem.name}, quantity: ${tempCartItem.quantity}, unitPrice: ${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`);

        console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
        console.log('----------------------------------------');
      }
      
    }  

    decrementQuantity(theCartItem: CartItem) {
      theCartItem.quantity--;

      if (theCartItem.quantity == 0) {
        this.remove(theCartItem)
      } 
      else {
        this.computeCartTotals();
      }
    }

    remove(theCartItem: CartItem) {
      
      // get the index of the item
      const itemIndex = this.cartItems.findIndex( tempCartItem => tempCartItem.id === theCartItem.id);

      // splice it from the array
      if(itemIndex > -1) {
        this.cartItems.splice(itemIndex, 1);
        this.computeCartTotals();
      }
    }
  }

