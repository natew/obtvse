class AdminController < ApplicationController

  layout 'admin'

  before_filter :authenticate

  def new
    @no_header = true
    @post = params[:id] ? Post.find(params[:id]) : Post.new
    @published = Post.where(draft:false).order('created_at desc')
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
    @post = Post.find_by_slug(params[:slug])
    @post.destroy

    respond_to do |format|
      format.html { redirect_to '/admin' }
      format.xml { head :ok }
    end
  end

end