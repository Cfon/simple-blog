// Post model
var Post = Backbone.Model.extend({
  defaults: {
    title: '',
    content: '',
    pubDate: new Date()
  }
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
  initialize({ posts }) {
    this.posts = posts;
  },
  render() {
    this.$el.html(this.tmpl());
    return this;
  },
  events: {
    'click button': 'createPost'
  },
  createPost() {
    this.posts.create({
      title: $('#title').val(),
      content: $('#content').val(),
      pubDate: new Date()
    });
    this.el.reset();
    return false;
  }
});

// Post list view
var PostListView = Backbone.View.extend({
  listTmpl: _.template($('#postListView').html()),
  itemTmpl: _.template($('#postListItemView').html()),
  initialize({ $main }) {
    this.$main = $main;
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
  newPost() {
    var np = new NewPostView({
      posts: this.collection
    });
    this.$main.html(np.render().el);
    return false;
  },
  viewPost(event) {
    var href = $(event.currentTarget).attr('href');
    var id = href.match(/\d+$/)[0];
    id = parseInt(id, 10);
    // console.log('viewPost #' + id);
    var pv = new PostView({
      model: this.collection.get(id)
    });
    this.$main.html(pv.render().el);
    return false;
  }
});

// Post view
var PostView = Backbone.View.extend({
  tmpl: _.template($('#postView').html()),
  render() {
    var model = this.model.toJSON();
    model.pubDate = new Date(Date.parse(model.pubDate)).toDateString();
    this.$el.html(this.tmpl(model));
    return this;
  },
});
