const { existsSync } = require('fs');
const path = require('path');
const express = require('express');
const es6Renderer = require('express-es6-template-engine');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');

const app = express();

// function
const { getAllFiles, getAllDirectory } = require('./sources/helper/images');
const template = require('./sources/helper/template');

const locals = {
  title: 'error',
  header: 'UPS !!! error occurred. The reason may be the wrong address.',
  info: 'The address should contain the name of the folder with photos.',
  address: 'http://localhost:3000/<b>name/folder-name</b>',
};

// template engine
app.engine('html', es6Renderer);
app.set('views', 'sources/views');
app.set('view engine', 'html');

// form
app.use(bodyParser.urlencoded({ extended: false }));

// path to css, images, favico

app.use('/vendor', express.static(path.join(__dirname, 'sources/vendor')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(favicon(path.join(__dirname, '/public/images/favicon.ico')));

// get post z formularza
app.post('/', (req, res) => {
  const {
    folderName,
    seoTitle,
    seoDescription,
    bodyTitle,
    bodyDate,
    bodyText,
    imageName,
    imageAlt,
    imageText,
  } = req.body;

  const imagePath = imageName.map((image, index) => `
    {
      "path": "./images/${folderName}/",
      "img": "${image}",
      "alt": "${imageAlt[index]}",
      "text": ${JSON.stringify(imageText[index])} 
    }`);


  const config = {
    nameFolder: folderName,
    seoTitle: JSON.stringify(seoTitle),
    seoDescription: JSON.stringify(seoDescription),
    bodyTitle: JSON.stringify(bodyTitle),
    bodyDate: JSON.stringify(bodyDate),
    bodyText: JSON.stringify(bodyText),
    images: imagePath,
  };

  // save json files
  template(config);

  res.redirect('./success');
});

app.get('/', (req, res) => {
  const list = path.join(__dirname, '/sources/views/list.html');
  res.render('allDirectory', {
    locals: {
      title: 'All directory',
      allFolders: getAllDirectory('./images/'),
    },
    partials: {
      partial: list,
    },
  });
});

// get
app.get('/name/:imageFolder', (req, res) => {
  const { imageFolder } = req.params;

  const index = path.join(__dirname, '/sources/views/images.html');
  const options = {
    imageFolder,
    size: 1200,
  };
  const allImages = getAllFiles(`./images/${options.imageFolder}/${options.size}/`);

  if (!existsSync(`./images/${options.imageFolder}`)) {
    res.render('404', {
      locals,
    });
    return;
  }

  res.render('index', {
    locals: {
      title: imageFolder,
      count: allImages.length,
      features: allImages,
    },
    partials: {
      partial: index,
    },
  });
});

app.get('/success', (req, res) => {
  res.render('success', {
    locals: {
      title: 'success',
      test: 'JSON has been saved to the data folder',
    },
  });
});

// 404 redirect
app.get('*', (req, res) => {
  res.status(404).render('404', {
    locals,
  });
});

// listen http://localhost:3000
app.listen(3000, () => {
  console.log('info', 'Server is runing at port: 3000');
});
