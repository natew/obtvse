class Image < ActiveRecord::Base
	include AttachmentHelper

	has_attachment :image,
		styles: {
			large: ['800x800#'],
			medium: ['256x256#'],
			small: ['64x64#'],
			icon: ['32x32#'],
			tiny: ['24x24#']
		}

	validates :image, :attachment_presence => true
end