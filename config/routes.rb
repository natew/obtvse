Obtvse::Application.routes.draw do

  # Admin
  match '/admin', to: 'admin#new'
  match '/get/:id', to: 'admin#get'
  match '/new', to: 'admin#new'
  post '/posts', to: 'admin#create'
  post '/edit/:id', to: 'admin#update'
  put '/edit/:id', to: 'admin#update'
  get '/edit/:id', to: 'admin#new', as: 'post'

  # Posts
  get '/:slug', to: 'posts#show', as: 'post'
  root to: 'posts#index'

end