///////////////////// Models, Collections //////////////////////

// Post
var Post = Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    pubDate: new Date()
  },
  initialize() {
    this.comments = new Comments([], { post: this });
  }
});

// Posts
var Posts = Backbone.Collection.extend({
  model: Post,
  url: '/posts'
});

// Comment
var Comment = Backbone.Model.extend({});

// Comments
var Comments = Backbone.Collection.extend({
  model: Comment,
  initialize(models, { post }) {
    this.post = post;
  },
  url() {
    return this.post.url() + '/comments';
  }
});

///////////////////// Views ///////////////////////////

// template settings
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// Post form view
var PostFormView = Backbone.View.extend({
  tagName: 'form',
  tmpl: _.template($('#postFormView').html()),
  initialize({ posts, router }) {
    this.posts = posts;
    this.router = router;
  },
  render() {
    this.$el.html(this.tmpl());
    return this;
  },
  events: {
    'click button': 'submitPost',
    'click a': 'back'
  },
  submitPost(event) {
    event.preventDefault();
    this.posts.create({
      title: $('#title').val(),
      content: $('#content').val(),
      pubDate: new Date()
    }, { success: () => {
      this.router.navigate('/', { trigger: true });
    }});
  },
  back(event) {
    event.preventDefault();
    this.router.navigate('/', { trigger: true });
  }
});

// Post list view
var PostListView = Backbone.View.extend({
  listTmpl: _.template($('#postListView').html()),
  itemTmpl: _.template($('#postListItemView').html()),
  initialize({ router }) {
    this.router = router;
  },
  render() {
    this.$el.html(this.listTmpl());
    var $ul = this.$el.find('ul');
    this.collection.forEach(post => {
      var itemHtml = this.itemTmpl(post.toJSON());
      $ul.append(itemHtml);
    });
    return this;
  },
  events: {
    'click #newPost': 'newPost',
    'click #viewPost': 'viewPost'
  },
  newPost(event) {
    event.preventDefault();
    this.router.navigate('/posts/new', { trigger: true });
  },
  viewPost(event) {
    event.preventDefault();
    var href = $(event.currentTarget).attr('href');
    this.router.navigate(href, { trigger: true });
  }
});

// Post view
var PostView = Backbone.View.extend({
  tmpl: _.template($('#postView').html()),
  initialize({ posts, router }) {
    this.posts = posts;
    this.router = router;
  },
  render() {
    var model = this.model.toJSON();
    model.pubDate = new Date(model.pubDate).toDateString();
    this.$el.html(this.tmpl(model));
    return this;
  },
  events: {
    'click a': 'handleClick'
  },
  handleClick(event) {
    event.preventDefault();
    var href = $(event.currentTarget).attr('href');
    this.router.navigate(href, { trigger: true });
  }
});

// Comment form view
var CommentFormView = Backbone.View.extend({
  tagName: 'form',
  tmpl: _.template($('#commentFormView').html()),
  initialize({ post, router }) {
    this.post = post;
    this.router = router;
  },
  render() {
    this.$el.html(this.tmpl(this.post));
    return this;
  },
  events: {
    'click button': 'submitComment',
    'click a': 'back'
  },
  submitComment(event) {
    event.preventDefault();
    this.post.comments.create({
      postId: this.post.get('id'),
      name: $('#name').val(),
      comment: $('#comment').val(),
      pubDate: new Date()
    });
    this.el.reset();
  },
  back(event) {
    event.preventDefault();
    var href = $(event.currentTarget).attr('href');
    this.router.navigate(href, { trigger: true });
  }
});

// Comment view
var CommentView = Backbone.View.extend({
  tmpl: _.template($('#commentView').html()),
  render() {
    var model = this.model.toJSON();
    model.pubDate = new Date(model.pubDate).toDateString();
    this.$el.html(this.tmpl(model));
    return this;
  }
});

// Comments view
var CommentsView = Backbone.View.extend({
  tmpl: _.template($('#commentsView').html()),
  initialize({ post, router }) {
    this.post = post;
    this.router = router;
    this.post.comments.on('add', this.addComment, this);
  },
  render() {
    this.$el.html(this.tmpl());
    var v = new CommentFormView({
      post: this.post,
      router: this.router
    });
    this.$el.append(v.render().el);
    this.post.comments.fetch();
    return this;
  },
  addComment(comment) {
    var v = new CommentView({
      model: comment
    });
    this.$el.append(v.render().el);
  }
});

/////////////////// Router ////////////////////////
// app router
var AppRouter = Backbone.Router.extend({
  initialize({ posts, $main }) {
    this.posts = posts;
    this.$main = $main;
  },
  routes: {
    '': 'index',
    'posts/new': 'newPost',
    'posts/:id': 'viewPost',
    'posts/:id/comments': 'viewComments'
  },
  index() {
    var v = new PostListView({
      collection: this.posts,
      router: this
    });
    this.$main.html(v.render().el);
  },
  viewPost(id) {
    var v = new PostView({
      model: this.posts.get(id),
      router: this
    });
    this.$main.html(v.render().el);
  },
  newPost() {
    var v = new PostFormView({
      posts: this.posts,
      router: this
    });
    this.$main.html(v.render().el);
  },
  viewComments(postId) {
    var post = this.posts.get(postId);
    var v = new CommentsView({
      post: post,
      router: this
    });
    this.$main.html(v.render().el);
  }
});
