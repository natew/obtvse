module InlineImagesHelper

  def supports_s3_upload?
    ENV["s3_bucket"] && ENV["s3_key"] && ENV["s3_secret"]
  end
end
