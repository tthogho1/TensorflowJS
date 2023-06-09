import * as fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';
import fetch from "node-fetch";

const folderPath = "C:/temp/images";
const pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/vectors/upsert";
const apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";

async function getVector(model,file) {
    // Load the image as a tensor
    const imageBuffer = fs.readFileSync(folderPath + "/" + file);
    const imageTensor = tf.node.decodeImage(imageBuffer);
    const imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
    const image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

    const features =  model.predict(image);

    const float32array = features.dataSync();
    const featureVector = Array.from(float32array.slice(0));

    return featureVector;
}

function createVector(file,featureVector){
    const vector = {};
    
    vector.id = file;
    vector.values = featureVector;
    return vector;
}

async function upsertVector(vectorlist){
    const res = await fetch(pineconeUrl,{
        method:'POST',
        headers : {
          'Content-Type': 'application/json',
          'Api-Key': apiKey
        },
        body : JSON.stringify({
          vectors: vectorlist,
          namespace: 'imageindex'
        })
      });
}

async function main() {

    const model = await tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1", { fromTFHub: true });
    console.log('load model');

    let vectorlist = [];
    const filelist = fs.readdirSync(folderPath);
    for ( const file of filelist) {
        console.log(file);

        const featureVector = await getVector(model,file);
        vectorlist.push(createVector(file,featureVector));

        if (vectorlist.length == 100){
            try {
                await upsertVector(vectorlist);
            }catch (e){
                console.log(e);
            }finally {
                vectorlist = [];
            }
        }
    };
    
    // last batch
    if (vectorlist.length > 0){
        await upsertVector(vectorlist);
    }
}

main();
