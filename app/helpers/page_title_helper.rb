module PageTitleHelper
  def html_title(content)
    if content.present?
      [content,INFO['name']].join(' - ')
    else
      INFO['name']
    end
  end

  def page_title(content)
    @title = content || INFO['name']
    render partial: 'name'
  end

  def linked_title
    link_to INFO['name'], root_path
  end
end
