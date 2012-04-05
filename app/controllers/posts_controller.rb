require 'rdiscount'

class PostsController < ApplicationController
	before_filter :authenticate, :except => [:index, :show]
	layout :choose_layout

	def index
		@posts = Post.page(params[:page]).per(10).where(draft:false)

		respond_to do |format|
			format.html
			format.xml { render :xml => @posts }
			format.rss { render :layout => false }
		end
	end

	def show
		@single_post = true
		@post = admin? ? Post.find_by_slug(params[:slug]) : Post.find_by_slug_and_draft(params[:slug],false)

		respond_to do |format|
			if @post.present?
				format.html
				format.xml { render :xml => @post }
			else
				format.any { head status: :not_found  }
			end
		end
	end

	def new
		@no_header = true
		@post = Post.new
		@published = Post.where(draft:false).page(params[:post_page])
		@drafts = Post.where(draft:true).page(params[:draft_page])

		respond_to do |format|
			format.html
		end
	end

	def get
		@post = Post.find_by_id(params[:id])
		render :text => @post.to_json
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
				format.text { render :text => "#{@post.id},#{@post.slug}" }
			else
				format.html { render :action => 'new' }
				format.xml { render :xml => @post.errors, :status => :unprocessable_entity}
				format.text { head :bad_request }
			end
		end
	end

	def update
		@post = Post.find(params[:id])

		respond_to do |format|
			if @post.update_attributes(params[:post])
				format.html { redirect_to "/edit/#{@post.id}", :notice => "Post updated successfully" }
				format.xml { head :ok }
				format.text { head :ok }
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
