import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';

import { Observable, of } from 'rxjs';

import { hot, cold } from 'jasmine-marbles';

import * as fromActions from '../actions/product.action';
import { ProductImageConverterService } from '../converters/product-image-converter.service';
import { ProductReferenceConverterService } from '../converters/product-reference-converter.service';
import { ProductLoaderService } from '../../occ/product.service';
import { Product } from '../../../occ/occ-models';
import { OccConfig } from '../../../occ/config/occ-config';
import { PageType } from '../../../occ/occ-models/occ.models';
import { RoutingService } from '../../../routing/facade/routing.service';

import * as fromEffects from './product.effect';
import { defaultOccProductConfig } from '../../config/product-config';

const MockOccModuleConfig: OccConfig = {
  server: {
    baseUrl: '',
    occPrefix: ''
  }
};

const router = {
  state: {
    url: '/',
    queryParams: {},
    params: {},
    context: { id: '1', type: PageType.PRODUCT_PAGE },
    cmsRequired: false
  }
};
class MockRoutingService {
  getRouterState() {
    return of(router);
  }
}

describe('Product Effects', () => {
  let actions$: Observable<fromActions.ProductAction>;
  let service: ProductLoaderService;
  let effects: fromEffects.ProductEffects;

  const productCode = 'testCode';
  const product: Product = {
    code: 'testCode',
    name: 'testProduct'
  };

  const mockProductState = {
    details: {
      entities: {
        testLoadedCode: { loading: false, value: product },
        testLoadingCode: { loading: true, value: null }
      }
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ product: () => mockProductState })
      ],
      providers: [
        ProductLoaderService,
        ProductImageConverterService,
        ProductReferenceConverterService,
        { provide: OccConfig, useValue: MockOccModuleConfig },
        { provide: OccConfig, useValue: defaultOccProductConfig },
        fromEffects.ProductEffects,
        provideMockActions(() => actions$),
        { provide: RoutingService, useClass: MockRoutingService }
      ]
    });
    service = TestBed.get(ProductLoaderService);
    effects = TestBed.get(fromEffects.ProductEffects);

    spyOn(service, 'load').and.returnValue(of(product));
  });

  describe('loadProduct$', () => {
    it('should return loadProductStart action if product not loaded', () => {
      const action = new fromActions.LoadProduct(productCode);
      const completion = new fromActions.LoadProductSuccess(product);

      actions$ = hot('-a', { a: action });
      const expected = cold('-b', { b: completion });
      expect(effects.loadProduct$).toBeObservable(expected);
    });
  });
});
