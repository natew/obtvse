Obtvse::Application.routes.draw do
  resources :posts
  match '/get/:id', :to => 'posts#get'
  match '/new', :to => 'posts#new'
  post '/edit/:id', :to => 'posts#update', :as  => 'post'
  match '/edit/:id', :to => 'posts#edit'
  get '/:slug', :to => 'posts#show', :as => 'post'
  delete '/:slug', :to => 'posts#destroy', :as  => 'post'
  root :to => 'posts#index'
end