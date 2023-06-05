import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new prop for pagination
  thePageNumber: number = 1;
  thePageSize: number = 10;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(private productService: ProductService, private cartService: CartService , private route: ActivatedRoute) { }

  ngOnInit(): void { //post construct from spring
    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });
  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    }
    else {
      this.handleListProducts();
    }
  }

  handleSearchProducts() {
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // if we have a different keyword same as before set page number to 1
    if(this.previousKeyword != theKeyword) {
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    // search for products using the keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               theKeyword).subscribe(this.processResult());
  }

  handleListProducts() {
     //check if id parameter is available
     const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

     if(hasCategoryId){
       // get the id param string and convert string to nubmer using the + symbol
       this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
     }
     else {
       //not cateogry id avaialble => default to 1
       this.currentCategoryId = 1;
     }

     // check if we have different category id than the previous

     // if we have a different category id than previous
     // then reset page number back to 1

     if(this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
     }

     this.previousCategoryId = this.currentCategoryId;

     console.log(`currentCategoryId= ${this.currentCategoryId}, thePageNumber = ${this.thePageNumber}`);
     
 
     // get the products for the given category id
     this.productService.getProductListPaginate(this.thePageNumber - 1, 
                                                this.thePageSize,
                                                this.currentCategoryId)
                                                .subscribe(this.processResult());
  }

  processResult() {
    return (data: any) => {
      console.log("mystery data" + JSON.stringify(data));
      
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }

  addToCart(theProduct: Product) {
    console.log(`Adding to cart:" ${theProduct.name}, ${theProduct.unitPrice}`);

    const theCartItem = new CartItem(theProduct);

    this.cartService.addToCart(theCartItem);
    
  }
}
