//import * as tf from '@tensorflow/tfjs'
import { PineconeClient } from "@pinecone-database/pinecone";
import * as fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';

// https://docs.pinecone.io/docs/node-client

const folderPath = "C:/temp/testimage";

async function getVector(model,file) {
    // Load the image as a tensor
    const imageBuffer = fs.readFileSync(folderPath + "/" + file);
    const imageTensor = tf.node.decodeImage(imageBuffer);
    const imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
    const image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

    const features =  model.predict(image);

    // Get the feature vector as a flat array
    const featureVector = features.dataSync();
    return featureVector;
}

// Path: trainModel.js
//const index = pinecone.Index("imagesindex");
function createVector(file,featureVector){
    const vector = {};
    
    vector.id = file;
    vector.values = featureVector;
    return vector;
}

async function upsertVector(index,vectorlist){
    const upsertRequest = {
        vectors: vectorlist,
    };
    const upsertResponse = await index.upsert( upsertRequest );
    console.log(upsertResponse);
}

async function main() {

    const model = await tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1", { fromTFHub: true });
    console.log('load model');

    const pinecone = new PineconeClient();
    await pinecone.init({
        environment: "us-east-1-aws",
        apiKey: "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846",
    })
    console.log('init index');

    /* Index作成
    await pinecone.createIndex({
        createRequest: {
          name: "imagesindex",
          dimension: 1280,
        },
    });*/
    const index = pinecone.Index("imagesindex");
    console.log('create index');

    let vectorlist = [];
    const filelist = fs.readdirSync(folderPath);
    for ( const file of filelist) {
        console.log(file);
        const featureVector = await getVector(model,file);
        vectorlist.push(createVector(file,featureVector));

        if (vectorlist.length == 100){
            try {
                await upsertVector(index,vectorlist);
            }catch (e){
                console.log(e);
            }finally {
                vectorlist = [];
            }
        }
    };

    console.log(vectorlist.length);
    if (vectorlist.length > 0){
        await upsertVector(index,vectorlist);
    }
}

main();
