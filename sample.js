"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//import * as tf from '@tensorflow/tfjs'
const pinecone_1 = require("@pinecone-database/pinecone");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const pinecone = new pinecone_1.PineconeClient();
        yield pinecone.init({
            environment: "us-east-1-aws",
            apiKey: "",
        });
        yield pinecone.createIndex({
            createRequest: {
                name: "example-index",
                dimension: 1024,
            },
        });
        const index = pinecone.Index("example-index");
        const upsertRequest = {
            vectors: [
                {
                    id: "vec1",
                    values: [0.1, 0.2, 0.3, 0.4],
                    metadata: {
                        genre: "drama",
                    },
                },
                {
                    id: "vec2",
                    values: [0.2, 0.3, 0.4, 0.5],
                    metadata: {
                        genre: "action",
                    },
                },
            ],
            namespace: "example-namespace",
        };
        const upsertResponse = yield index.upsert({ upsertRequest });
        console.log(upsertResponse);
    });
}
main();
