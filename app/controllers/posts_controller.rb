class PostsController < ApplicationController
  before_filter :authenticate, :except => [:index, :show]
  layout :choose_layout

  def index
    @posts = Post.where(draft:false).order('published_at desc').page(params[:page]).per(10)

    respond_to do |format|
      format.html
      format.xml { render :xml => @posts }
      format.rss { render :layout => false }
    end
  end

  def show
    @single_post = true
    @post = admin? ? Post.find_by_slug!(params[:slug]) : Post.find_by_slug_and_draft!(params[:slug],false)

    respond_to do |format|
      if @post.present?
        format.html
        format.xml { render :xml => @post }
      else
        format.any { render :status => 404  }
      end
    end
  end

  def new
    @no_header = true
    @post = params[:id] ? Post.find(params[:id]) : Post.first
    @post ||= Post.new 
    @published = Post.where(draft:false).order('published_at desc')
    @drafts = Post.where(draft:true).order('updated_at desc')

    respond_to do |format|
      format.html
    end
  end

  def get
    @post = Post.find_by_id(params[:id])
    render :text => @post.to_json
  end

  def create
    @post = Post.new(params[:post])

    respond_to do |format|
      if @post.save
        format.html { redirect_to "/edit/#{@post.id}", :notice => "Post created successfully" }
        format.xml { render :xml => @post, :status => :created, location: @post }
        format.text { render :text => @post.to_json }
      else
        format.html { render :action => 'new' }
        format.xml { render :xml => @post.errors, :status => :unprocessable_entity}
        format.text { head :bad_request }
      end
    end
  end

  def update
    @post = Post.find_by_id(params[:id])

    # Set published_at if we are publishing for the first time
    if @post.published_at.nil? and params[:post]['draft'] == '0'
      params[:post]['published_at'] = Time.now
    end

    respond_to do |format|
      if @post.update_attributes(params[:post])
        format.html { redirect_to "/edit/#{@post.id}", :notice => "Post updated successfully" }
        format.xml { head :ok }
        format.text { render :text => @post.to_json }
      else
        format.html { render :action => 'edit' }
        format.xml { render :xml => @post.errors, :status => :unprocessable_entity}
        format.text { head :bad_request }
      end
    end
  end

  def destroy
    @post = Post.find_by_slug(params[:id])
    @post.destroy

    respond_to do |format|
      format.html { redirect_to '/admin' }
      format.xml { head :ok }
    end
  end

  private

  def admin?
    session[:admin] == true
  end

  def choose_layout
    if ['admin', 'new', 'edit', 'create'].include? action_name
      'admin'
    else
      'application'
    end
  end
end
