#!/usr/bin/env bash
# Copyright (c) 2019-present, Anton Makarov <zer0c14@gmail.com>
# See the LICENSE for more information.

session_id=${XDG_SESSION_ID:=${SSH_TOOLS_SESSION_ID}}
session_dir=${TMPDIR:=/tmp}/@zer0c14/ssh-tools/${session_id}
mkdir -p "${session_dir}"

cmd_queue=$(mktemp -p "${session_dir}" -t cmd.XXXXXXXXXX --suffix=.queue)
command=${cmd_queue}$'\cc'${PWD}
for i in "$@"; do
  command=${command}$'\cc'${i}
done
echo "${command}" >> "${session_dir}"/commands.queue

exit_code=0
cmd_queue_pos=1
start_timestamp=$(date +%s)
max_idle_timeout=${SSH_TOOLS_IDLE_TIMEOUT:=60}

while true; do
  # @future - remove 1st line, using mkfifo, other alternatives
  # @future - add file exists validators (capture another session)
  cmd_queue_line=$(sed -n ${cmd_queue_pos}p "${cmd_queue}")
  if [ "${cmd_queue_line}" ]; then
    start_timestamp=$(date +%s)
    IFS=':' read -ra cmd_parts <<< "${cmd_queue_line}"

    # @future - add other commands (streams, tail/chunk, networks)
    case ${cmd_parts[0]} in
      STDOUT)
        >&1 cat "${cmd_parts[1]}"
        ;;
      STDERR)
        >&2 cat "${cmd_parts[1]}"
        ;;
      EXIT)
        exit_code=${cmd_parts[1]}
        break
        ;;
    esac
    cmd_queue_pos=$((cmd_queue_pos + 1))
  elif [ $(($(date +%s) - start_timestamp)) -gt ${max_idle_timeout} ]; then
      >&2 echo "Maximum wait time ${max_idle_timeout} seconds exceeded!!!"
      exit_code=1
      break
  fi
done

# @future - remove cmd_queue files by links (using lists)
exit "${exit_code}"
