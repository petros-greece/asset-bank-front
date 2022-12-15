import { NgModule } from "@angular/core";
import { 
  ApiPathPipe,  ApiPathSmPipe, OnlyNumberPipe,
  RoundNumPipe, SortObjArrPipe
} from "./asset-bank-pipes.pipe";

const BankPipes = [
  ApiPathPipe,
  ApiPathSmPipe,
  OnlyNumberPipe, 
  RoundNumPipe,
  SortObjArrPipe
];

@NgModule({
  declarations: BankPipes,
  exports: BankPipes
})
export class BankPipesModule {}
