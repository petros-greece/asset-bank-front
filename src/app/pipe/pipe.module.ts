import { NgModule } from "@angular/core";
import { 
  ApiPathPipe 
} from "./asset-bank-pipes.pipe";

const BankPipes = [
  ApiPathPipe, 
];

@NgModule({
  declarations: BankPipes,
  exports: BankPipes
})
export class BankPipesModule {}
