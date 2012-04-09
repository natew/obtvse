class ImagesController < ApplicationController
  def create
    @image = Image.create(params[:doc])
    render :json => {
      :policy => s3_upload_policy_document,
      :signature => s3_upload_signature,
      :key => @image.s3_key,
      :success_action_redirect => document_upload_success_document_url(@image)
    }
  end

  # just in case you need to do anything after the document gets uploaded to amazon.
  # but since we are sending our docs via a hidden iframe, we don't need to show the user a
  # thank-you page.
  def s3_confirm
    head :ok
  end

  private

  # generate the policy document that amazon is expecting.
  def s3_upload_policy_document
    return @policy if @policy
    ret = {"expiration" => 5.minutes.from_now.utc.xmlschema,
      "conditions" =>  [
        {"bucket" =>  CONFIG['bucket_name']},
        ["starts-with", "$key", @image.s3_key],
        {"acl" => "private"},
        {"success_action_status" => "200"},
        ["content-length-range", 0, 1048576]
      ]
    }
    @policy = Base64.encode64(ret.to_json).gsub(/\n/,'')
  end

  # sign our request by Base64 encoding the policy document.
  def s3_upload_signature
    signature = Base64.encode64(OpenSSL::HMAC.digest(OpenSSL::Digest::Digest.new('sha1'), CONFIG['secret_access_key'], s3_upload_policy_document)).gsub("\n","")
  end
end
