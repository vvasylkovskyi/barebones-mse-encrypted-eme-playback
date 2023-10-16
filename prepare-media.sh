#!/usr/bin/env bash

packager in=./BigBuckBunny.mp4,stream=video,init_segment='./segments/BigBuckBunny_0.mp4',segment_template='./segments/BigBuckBunny_$Number%01d$.mp4' \
    --segment_duration 2 \
    --enable_fixed_key_encryption \
    --clear_lead=2 \
    --keys label=HD:key_id=A16E402B9056E371F36D348AA62BB749:key=87237D20A19F58A740C05684E699B4AA,label=SD:key_id=A16E402B9056E371F36D348AA62BB749:key=87237D20A19F58A740C05684E699B4AA
