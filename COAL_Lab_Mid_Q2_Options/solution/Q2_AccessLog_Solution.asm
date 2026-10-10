; Q2: Access Control Log (Packed Date & Time) - Solution
; Assemble: nasm Q2_AccessLog_Solution.asm -o q2.com
[org 0x0100]
        jmp start

log:          dw 0x5D4E,0x49E0, 0x5D4E,0x40AF, 0x5DA2,0x5000, 0x5D4E,0x8DA5, 0x5D4E,0xC800
n:            dw 5
invalidCount: dw 0
firstIdx:     dw 0xFFFF
lastIdx:      dw 0xFFFF
duration:     dw 0xFFFF

;------------------------------------------------------------
; Validate(date, time) -> AX = 1 valid, 0 invalid
; push date, push time, call Validate
; [bp+6] = date, [bp+4] = time
;------------------------------------------------------------
Validate:
        push bp
        mov  bp, sp
        push bx

        mov  ax, 0                  ; assume invalid

        ; Month = bits 8-5 of date (1..12)
        mov  bx, [bp+6]
        shr  bx, 5
        and  bx, 0x000F
        cmp  bx, 1
        jb   v_done
        cmp  bx, 12
        ja   v_done

        ; Day = bits 4-0 of date (1..31)
        mov  bx, [bp+6]
        and  bx, 0x001F
        cmp  bx, 1
        jb   v_done                 ; (5 bits can never exceed 31)

        ; Hour = bits 15-11 of time (0..23)
        mov  bx, [bp+4]
        shr  bx, 11
        cmp  bx, 23
        ja   v_done

        ; Minute = bits 10-5 of time (0..59)
        mov  bx, [bp+4]
        shr  bx, 5
        and  bx, 0x003F
        cmp  bx, 59
        ja   v_done

        ; Seconds/2 = bits 4-0 of time (0..29)
        mov  bx, [bp+4]
        and  bx, 0x001F
        cmp  bx, 29
        ja   v_done

        mov  ax, 1                  ; all fields in range
v_done:
        pop  bx
        pop  bp
        ret  4

;------------------------------------------------------------
; Compare(d1, t1, d2, t2) -> AX = 1 if entry1 is earlier than entry2
; push d1, push t1, push d2, push t2, call Compare
; [bp+10]=d1 [bp+8]=t1 [bp+6]=d2 [bp+4]=t2
; No field extraction: compare whole words as UNSIGNED numbers.
;------------------------------------------------------------
Compare:
        push bp
        mov  bp, sp
        push bx

        mov  ax, 0
        mov  bx, [bp+10]
        cmp  bx, [bp+6]             ; date1 vs date2
        jb   c_earlier
        ja   c_done
        mov  bx, [bp+8]             ; same date -> time1 vs time2
        cmp  bx, [bp+4]
        jae  c_done
c_earlier:
        mov  ax, 1
c_done:
        pop  bx
        pop  bp
        ret  8

;------------------------------------------------------------
; ToMinutes(time) -> AX = hour*60 + minute
; [bp+4] = time
;------------------------------------------------------------
ToMinutes:
        push bp
        mov  bp, sp
        push bx
        push dx

        mov  ax, [bp+4]
        shr  ax, 11                 ; hour
        mov  bx, 60
        mul  bx                     ; AX = hour*60
        mov  bx, [bp+4]
        shr  bx, 5
        and  bx, 0x003F             ; minute
        add  ax, bx

        pop  dx
        pop  bx
        pop  bp
        ret  2

;------------------------------------------------------------
start:
        mov  si, log                ; SI -> current entry
        mov  cx, 0                  ; CX = index i

next_entry:
        cmp  cx, [n]
        jae  find_duration

        push word [si]              ; date
        push word [si+2]            ; time
        call Validate
        cmp  ax, 1
        je   is_valid
        inc  word [invalidCount]
        jmp  advance

is_valid:
        cmp  word [firstIdx], 0xFFFF ; first valid entry seen?
        jne  check_first
        mov  [firstIdx], cx
        mov  [lastIdx], cx
        jmp  advance

check_first:                        ; is current earlier than first?
        mov  bx, [firstIdx]
        shl  bx, 2                  ; each entry = 4 bytes
        push word [si]
        push word [si+2]
        push word [log+bx]
        push word [log+bx+2]
        call Compare
        cmp  ax, 1
        jne  check_last
        mov  [firstIdx], cx

check_last:                         ; is last earlier than current?
        mov  bx, [lastIdx]
        shl  bx, 2
        push word [log+bx]
        push word [log+bx+2]
        push word [si]
        push word [si+2]
        call Compare
        cmp  ax, 1
        jne  advance
        mov  [lastIdx], cx

advance:
        add  si, 4
        inc  cx
        jmp  next_entry

find_duration:
        cmp  word [firstIdx], 0xFFFF ; no valid entry at all
        je   exit
        mov  bx, [firstIdx]
        shl  bx, 2
        mov  di, [lastIdx]
        shl  di, 2
        mov  ax, [log+bx]
        cmp  ax, [log+di]           ; same date word?
        jne  exit                   ; different date -> keep FFFFh

        push word [log+di+2]
        call ToMinutes
        mov  dx, ax                 ; DX = minutes of last
        push word [log+bx+2]
        call ToMinutes              ; AX = minutes of first
        sub  dx, ax
        mov  [duration], dx

exit:
        mov  ax, 0x4C00
        int  0x21
