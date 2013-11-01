(function(n){

  var style = {
    ul: {
      layout: {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        textAlign: 'left', 
        background: 'rgba(255,255,255,.7)'
      },
      sandbox: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        padding: 20,
        overflow: 'auto'
      }
    },
    user: {
      layout: {
        position: 'relative',
      },
      info: {
        width: 200,
        display: 'inline-block',
        verticalAlign: 'middle',
        padding: 20
      },
      sandbox: {
        display: 'inline-block',
        verticalAlign: 'middle',
        border: 'solid 1px',
        borderColor: (new Array(4)).join('rgba(255,255,255,0) ') + '#999',
        borderRadius: '5px'
      },
      avatar: {
        float: 'left',
        width: 48,
        height: 48,
        margin: 10
      },
      link: {},
      clearfix: {
        clear: 'left'
      }
    }
  };


  function UserList( n ) {
    var _self = this;
    this.names = [];
    this.users = [];

    $('body').css({overflow:'hidden'});
    this.$layout = $('<div>').
      css( style.ul.layout ).
      addClass('y-layout').
      appendTo('body');
    this.$sandBox = $('<div>').css( style.ul.sandbox ).
      appendTo( this.$layout );

    $('.avatar:lt('+ n +') a').each(function(){
      var _un = $(this).attr('href');
      console.log( _un );
      _self.add( $( this ) );
      
    });
    
  }
  
  UserList.prototype.add = function( $link, inviter ) {
    var _name = $link.attr('href').split('/');
    var name = _name[ _name.length - 1 ] || _name[ _name.length - 2 ]; 
    var _user = this.find( name );
    if ( !_user ) {

      var _user = new User( $link, name, this, inviter );
      this.names.push( name );
      this.users.push( _user );
    };

    return _user;
  };

  UserList.prototype.find = function( name ) {
    var i = this.names.indexOf( name );
    if ( i + 1 ) {
      return this.users[ i ];
    };
    return false;
  }

  function User( $link, name, parent, inviter ) {
    this.target = $link.attr('href');
    this.inviter = inviter||false;
    this.parent = parent;
    this.name = name;
    this.children = [];

    this.$layout = $('<div>').
      css( style.user.layout ).
      addClass('y-layout');
    this.$info = $('<div>').
      css( style.user.info ).
      appendTo( this.$layout );
    this.$link = $('<a href="'+ this.target +'">').
      text( this.name ).
      css( style.user.link ).
      appendTo( this.$info );
    this.$sandBox = $('<div>').
      addClass('y-sandbox').
      css( style.user.sandbox ).
      appendTo( this.$layout );
    if (this.inviter) {
      this.layoutAppend(this.inviter.$sandBox);
    } else {
      this.layoutAppend(this.parent.$sandBox);
    }


    this.get( $link.attr('href') );

    return this
  }

  User.prototype.get = function( url ) {
    var _self = this,
        cb = $.proxy( this.getInfo, this ),
        tryAgain = function(){
          setTimeout( function(){
            _self.get( url );
          }, 1000 + 3000*Math.random() );
        };
    $.ajax({
      url: url,
      success: cb,
      error: tryAgain,
      dataType: 'text'
    });
  }

  User.prototype.layoutAppend = function( $target ){
    $target.append( this.$layout );
  };

  User.prototype.setAvatar = function( $img ){
    this.avatar = new Image();
    this.avatar.onload = $.proxy( this.avatarReady, this );
    this.avatar.src = $img.attr('src');
  }
  User.prototype.avatarReady = function(){
    $(this.avatar).css( style.user.avatar );
    this.$info.prepend( this.avatar );
    this.$info.append( $('<div>').css( style.user.clearfix ) );
  }
  User.prototype.setInviter = function( user ){
    this.inviter = user;
    this.layoutAppend( user.$sandBox );
  }
  User.prototype.addChild = function( user ){
    this.children.push( user );
  }

  User.prototype.getInfo = function( html ){
    var _self = this;

    var ava = html.match('<img.+alt="avatar" />');
    if (ava) {
      this.setAvatar( $( ava[0] ) );
    }

    if ( !this.inviter ) {
      var link = html.match('<a id="invited-by".+>');
      if ( link ) {
        var _invitor = this.parent.add( $( link[0] ) );
        this.setInviter(
          _invitor
        )
      };
    };

    var _child = html.match(/<ul class="grey" id="invited_data_items">[\s\S]+<\/ul>/);
    if ( _child ) {
      $( _child[0] ).find('a').each(function(){
        _self.addChild( _self.parent.add( $(this), _self ) );
      });
    }
  }

  window.___ul = new UserList( n );

})( 4 );
