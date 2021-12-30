#!/bin/bash

if [[ -s "$HOME/.asdf/asdf.sh" ]]; then
  . "$HOME/.asdf/asdf.sh"
fi
if [[ -s "$HOME/.asdf/completions/asdf.bash" ]]; then
  . $HOME/.asdf/completions/asdf.bash
fi
