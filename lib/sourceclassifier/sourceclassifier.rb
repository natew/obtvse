#encoding: UTF-8

require 'rubygems'
require 'classifier'
require 'yaml'

class SourceClassifier
  attr_reader :training_file

  def initialize(training_file=nil)
    training_file = File.join(File.dirname(__FILE__), 'trainer.yaml') unless training_file
    @training_file = training_file
    open(@training_file, "r:utf-8") { |f| @c = YAML.load(f)}
  end

  def languages
    @c.categories
  end

  def identify(str)
    @c.classify(str)
  end
end