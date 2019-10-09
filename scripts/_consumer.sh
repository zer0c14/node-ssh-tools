#!/usr/bin/env bash
# Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
# See the LICENSE for more information.

# @feature - add command position options
session_id=${XDG_SESSION_ID:=${SSH_TOOLS_SESSION_ID}}
session_dir=${TMPDIR:=/tmp}/@zer0c14/ssh-tools/${session_id}
mkdir -p "${session_dir}"
touch "${session_dir}"/commands.queue
tail -f "${session_dir}"/commands.queue
