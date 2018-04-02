// Post model
var Post = Backbone.Model.extend({
  // defaults: {
  //   title: '',
  //   content: '',
  //   pubDate: new Date()
  // }
});

// Post collection
var Posts = Backbone.Collection.extend({
  model: Post,
  url: '/posts'
});

// template settings
_.templateSettings = {
  interpolate: /\{\{(.+?)\}\}/g
};

// New post view
var NewPostView = Backbone.View.extend({
  tagName: 'form',
  tmpl: _.template($('#newPostView').html()),
  initialize({ posts, router }) {
    this.posts = posts;
    this.router = router;
  },
  render() {
    this.$el.html(this.tmpl());
    return this;
  },
  events: {
    'click button': 'createPost',
    'click a': 'allPosts'
  },
  createPost(event) {
    this.posts.create({
      title: $('#title').val(),
      content: $('#content').val(),
      pubDate: new Date()
    });
    this.router.navigate('/', { trigger: true });
    return false;
  },
  allPosts(event) {
    this.router.navigate('/', { trigger: true });
    return false;
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
    this.router.navigate('/posts/new', { trigger: true });
    return false;
  },
  viewPost(event) {
    var href = $(event.currentTarget).attr('href');
    this.router.navigate(href, { trigger: true });
    return false;
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
    'click a': 'allPosts'
  },
  allPosts(event) {
    this.router.navigate('/', { trigger: true });
    return false;
  }
});

// app router
var AppRouter = Backbone.Router.extend({
  initialize({ posts, $main }) {
    this.posts = posts;
    this.$main = $main;
  },
  routes: {
    '': 'index',
    'posts/new': 'newPost',
    'posts/:id': 'viewPost'
  },
  index() {
    var plv = new PostListView({
      collection: this.posts,
      router: this
    });
    this.$main.html(plv.render().el);
  },
  viewPost(id) {
    var pv = new PostView({
      model: this.posts.get(id),
      router: this
    });
    this.$main.html(pv.render().el);
  },
  newPost() {
    var npv = new NewPostView({
      posts: this.posts,
      router: this
    });
    this.$main.html(npv.render().el);
  }
});
