import * as fs from 'fs';
import * as tf from '@tensorflow/tfjs-node';
import fetch from "node-fetch";

const folderPath = "C:/temp/images";
const pineconeUrl = "https://imageindex-c5a7176.svc.us-east-1-aws.pinecone.io/query";
const apiKey = "83d5fc94-5fd6-4d8a-ba7e-f7187ae79846";

async function getVector(model,file) {
    // Load the image as a tensor
    const imageBuffer = fs.readFileSync(folderPath + "/" + file);
    const imageTensor = tf.node.decodeImage(imageBuffer);
    const imageResized = tf.image.resizeBilinear(imageTensor, [96, 96]);
    const image = imageResized.expandDims(0).toFloat().div(tf.scalar(127)).sub(tf.scalar(1));

    const features =  model.predict(image);

    // Get the: feature vector as a flat array
    const float32array = features.dataSync();
    const featureVector = Array.from(float32array.slice(0));

    return featureVector;
}

async function queryVector(featureVector){
    const res = await fetch(pineconeUrl,{
        method:'POST',
        headers : {
          'Content-Type': 'application/json',
          'Api-Key': apiKey
        },
        body: JSON.stringify({
    		vector: featureVector,
    		topK: 5,
    		includeMetadata: false,
    		includeValues: false,
    		namespace: 'imageindex'
  		})
      });

    const json = await res.json();
    return json;
}

async function main() {
    const model = await tf.loadGraphModel("https://tfhub.dev/google/tfjs-model/imagenet/mobilenet_v2_100_96/feature_vector/2/default/1", { fromTFHub: true });
    console.log('load model');

    const file = "1011516521.jpg";
    const featureVector = await getVector(model,file);

    const res = await queryVector(featureVector);
    console.log(res);
}

main();
