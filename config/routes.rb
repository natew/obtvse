Obtvse::Application.routes.draw do
  resources :posts
  match '/admin', to: 'posts#admin'
  match '/new', to: 'posts#new'
  match '/edit/:id', to: 'posts#edit', as: 'post'
  match '/:slug', to: 'posts#show', as: 'post'
  root to: 'posts#index'
end