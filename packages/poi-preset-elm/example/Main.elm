module Main exposing (..)

import Html exposing (..)
import Html.Events exposing (onClick)


type alias Model =
    Int


model : Model
model =
    0


type Msg
    = Increment
    | Decrement


update : Msg -> Model -> Model
update msg model =
    case msg of
        Increment ->
            model + 1

        Decrement ->
            model - 1


view : Model -> Html Msg
view model =
    div []
        [ button [ onClick Decrement ] [ text "-" ]
        , div [] [ text (toString model) ]
        , button [ onClick Increment ] [ text "+" ]
        ]


main =
    Html.beginnerProgram
        { model = model
        , view = view
        , update = update
        }
