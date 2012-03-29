xml.instruct! :xml, :version => "1.0"
xml.rss :version => "2.0" do
  xml.channel do
    xml.title CONFIG['title']
    xml.description CONFIG['tagline']
    xml.link root_url

    for post in @posts
      xml.item do
        xml.title post.title
        if post.content
          xml.description markdown(post.content).to_html
        else
          xml.description "No content"
        end
        xml.pubDate post.created_at.to_formatted_s(:day_month_year)
        xml.link post_url(post)
        xml.guid post_url(post)
      end
    end
  end
end
