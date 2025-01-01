class HomeController < ApplicationController
  def index
    @voice = Voice.new

    @session = @voice.create_realtime_session
  end
end
