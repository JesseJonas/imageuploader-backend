const mongoose = require('mongoose');
const aws = require('aws-sdk');

// Lib para lidar com arquivos
const fs = require('fs');
const path = require('path');

// Utilizar o novo formato de promises
const { promisify } = require('util');

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Verificar se está sendo enviado para o aws
 * se estiver local, use a URL local, de .env
 */
PostSchema.pre("save", function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

// Antes de deletar um post, delete a sua imagem
PostSchema.pre('remove', function(){
  if (process.env.STORAGE_TYPE === 's3'){
    return s3.
    deleteObject({
      Bucket: 'imagineload',
      Key: this.key
    })
    .promise()
    .then(response => {
      console.log(response.status);
    })
    .catch(response => {
      console.log(response.status);
    });
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
    );
  }
});

module.exports = mongoose.model("Post", PostSchema);