class InlineImagesController < ApplicationController
  
  respond_to :js
  respond_to :html
  
  def new
    @image = InlineImage.new
  end  
  
  def create
    @image = InlineImage.new(params[:inline_image])
    respond_to do |format|
      if @image.save 
        format.html {  
          render :json => @image.image.url(:medium).to_json, 
            :content_type => 'text/html',
            :layout => false
          }
        format.json {  
          render :json => @image.image.url(:medium).to_json			
          }
          logger.debug "success"
      else
         format.html {  
            render :json => @image.errors, 
              :content_type => 'text/html',
              :layout => false
            }
          format.json {  
            render :json => @image.errors			
            }
          logger.debug "#{@image.errors}"
      end
    end  
  end
  
end
