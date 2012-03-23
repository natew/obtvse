require 'rdiscount'

class PostsController < ApplicationController
  before_filter :authenticate, except: [:index, :show]
  layout :choose_layout

  def index
    @posts = Post.page(params[:page]).per(20)
    @posts = @posts.where(draft:false) if !session[:admin]

    respond_to do |format|
      format.html
      format.xml { render :xml => @posts }
      format.rss { render :layout => false }
    end
  end

  def admin
    @no_header = true
    @post = Post.new
    @published = Post.where(draft:false).page(params[:page]).per(20)
    @drafts = Post.where(draft:true).page(params[:page_draft]).per(20)

    respond_to do |format|
      format.html
    end
  end

  def show
    @show = true
    no_drafts = !session[:admin] ? true : false
    @post = Post.find_by_slug(params[:slug])

    respond_to do |format|
      format.html
      format.xml { render :xml => @post }
    end
  end

  def new
    @no_header = true
    @posts = Post.page(params[:page]).per(20)
    @post = Post.new

    respond_to do |format|
      format.html
      format.xml { render xml: @post }
    end
  end

  def edit
    @no_header = true
    @post = Post.find(params[:id])
  end

  def create
    @post = Post.new(params[:post])

    respond_to do |format|
      if @post.save
        format.html { redirect_to "/edit/#{@post.id}", :notice => "Post created successfully" }
        format.xml { render :xml => @post, :status => :created, location: @post }
      else
        format.html { render :action => 'new' }
        format.xml { render :xml => @post.errors, :status => :unprocessable_entity}
      end
    end
  end

  def update
    @post = Post.find_by_slug(params[:slug])

    respond_to do |format|
      if @post.update_attributes(params[:post])
        format.html { redirect_to "/edit/#{@post.id}", :notice => "Post updated successfully" }
        format.xml { head :ok }
      else
        format.html { render :action => 'edit' }
        format.xml { render :xml => @post.errors, :status => :unprocessable_entity}
      end
    end
  end

  def destroy
    @post = Post.find_by_slug(params[:slug])
    @post.destroy

    respond_to do |format|
      format.html { redirect_to '/admin' }
      format.xml { head :ok }
    end
  end

  private

  def choose_layout
    if ['admin', 'new', 'edit'].include? action_name
      'admin'
    else
      'application'
    end
  end
end
