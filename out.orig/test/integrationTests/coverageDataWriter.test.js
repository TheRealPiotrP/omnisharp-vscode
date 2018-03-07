"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("async-file");
suiteTeardown(() => __awaiter(this, void 0, void 0, function* () {
    if (__coverage__) {
        if (!(yield fs.exists("./.nyc_output"))) {
            yield fs.mkdir("./.nyc_output");
        }
        let logFilePath = `./.nyc_output/nyc_output.json`;
        yield fs.writeTextFile(logFilePath, JSON.stringify(__coverage__));
    }
}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY292ZXJhZ2VEYXRhV3JpdGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi90ZXN0L2ludGVncmF0aW9uVGVzdHMvY292ZXJhZ2VEYXRhV3JpdGVyLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLGlDQUFpQztBQUlqQyxhQUFhLENBQUMsR0FBUyxFQUFFO0lBQ25CLEVBQUUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUM7UUFDakIsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUVELElBQUksV0FBVyxHQUFHLCtCQUErQixDQUFDO1FBRWxELE1BQU0sRUFBRSxDQUFDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7QUFDUCxDQUFDLENBQUEsQ0FBQyxDQUFBIn0=