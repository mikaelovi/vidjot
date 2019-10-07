const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

// map global promise - get rid of warning
mongoose.Promise = global.Promise;

// connect to mongoose
mongoose.connect('mongodb://localhost/vidjot-dev', {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
  .then(() => console.log('MongoDB Connected...')).catch(err => console.log(err));

// load Idea Model
require('./models/Idea');
const Idea = mongoose.model('ideas');

// handlebars middleware
app.engine('handlebars', exphbs({
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// body parser middleware
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// index route
app.get('/', (req, res) => {
  const title = 'Welcome';
  res.render('index', {
    title: title
  });
});

// about route
app.get('/about', (req, res) => {
  res.render('about');
});

// idea index page
app.get('/ideas', (req, res) => {
  Idea.find({})
    .sort({data:'desc'})
    .then(ideas => {
      res.render('ideas/index', {
        ideas:ideas
      });
    });
});

// add idea form
app.get('/ideas/add', (req, res) => {
  res.render('ideas/add');
});

// edit idea form
app.get('/ideas/edit/:id', (req, res) => {
  Idea.findOne({
    _id: req.params.id
  })
  .then(idea => {
    res.render('ideas/edit', {
      idea:idea
    });
  });
});

// process form
app.post('/ideas', (req, res)=> {
  let errors = [];
  if(!req.body.title){
    errors.push({text: 'Please add a title'});
  }
  if(!req.body.details){
    errors.push({text: 'Please add some details'});
  }

  if(errors.length > 0){
    res.render('ideas/add',  {
      errors: errors,
      title: req.body.title,
      details: req.body.details
    })
  } else {
    const newUser = {
      title: req.body.title,
      details: req.body.details
    }
    new Idea(newUser)
      .save()
      .then(idea => {
        res.redirect('/ideas');
      });
  }
});

// edit form process
app.put('/ideas/:id', (req, res) => {
  res.send('PUT');
});

const port = 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});