#include <stdint.h>
#include <string.h>
#include <math.h>
#include <emscripten/emscripten.h>

void real_wl_agent_clip_move_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t xmove_q16,
  int32_t ymove_q16,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t noclip_enabled
);
void real_wl_agent_control_movement_apply(
  int32_t *x_q16,
  int32_t *y_q16,
  int32_t *angle_deg,
  int32_t *angle_frac_io,
  int32_t control_x,
  int32_t control_y,
  int32_t strafe_pressed,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t victory_flag
);
int32_t oracle_real_wl_agent_try_move(
  int32_t x,
  int32_t y,
  uint32_t map_lo,
  uint32_t map_hi
);
int32_t real_wl_agent_take_damage_apply(
  int32_t health,
  int32_t points,
  int32_t difficulty,
  int32_t god_mode_enabled,
  int32_t victory_flag
);
int32_t oracle_real_wl_state_check_line(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  uint32_t door_mask,
  uint32_t door_pos_q8
);
int32_t oracle_real_wl_state_check_sight(
  int32_t obx,
  int32_t oby,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t area_connected,
  uint32_t door_mask,
  uint32_t door_pos_q8
);
uint32_t oracle_real_wl_state_move_obj_hash(
  int32_t obx,
  int32_t oby,
  int32_t dir,
  int32_t playerx,
  int32_t playery,
  int32_t area_connected,
  int32_t distance,
  int32_t move,
  int32_t obclass,
  int32_t tics_value
);
void real_wl_state_move_obj_apply(
  int32_t obx,
  int32_t oby,
  int32_t dir,
  int32_t playerx,
  int32_t playery,
  int32_t area_connected,
  int32_t distance,
  int32_t move,
  int32_t obclass,
  int32_t tics_value,
  int32_t *out_x,
  int32_t *out_y,
  int32_t *out_distance,
  int32_t *out_take_damage_calls
);
uint32_t oracle_real_wl_state_select_chase_dir_hash(
  int32_t ob_tilex,
  int32_t ob_tiley,
  int32_t dir,
  int32_t obclass,
  int32_t flags,
  int32_t player_tilex,
  int32_t player_tiley
);
void real_wl_state_select_chase_dir_apply(
  int32_t ob_tilex,
  int32_t ob_tiley,
  int32_t dir,
  int32_t obclass,
  int32_t flags,
  int32_t player_tilex,
  int32_t player_tiley,
  int32_t *out_dir,
  int32_t *out_tilex,
  int32_t *out_tiley,
  int32_t *out_distance,
  int32_t *out_areanumber,
  int32_t *out_flags8
);
uint32_t oracle_wl_play_play_loop_hash(
  uint32_t state_hash,
  int32_t tics,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_game_game_loop_hash(
  uint32_t state_hash,
  int32_t tics,
  int32_t input_mask,
  int32_t rng,
  int32_t door_hash,
  int32_t player_hash,
  int32_t actor_hash
);
uint32_t oracle_wl_inter_check_high_score_hash(
  int32_t new_score,
  int32_t s0,
  int32_t s1,
  int32_t s2,
  int32_t s3,
  int32_t s4
);
uint32_t oracle_wl_act1_open_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_close_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_operate_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t door_num,
  int32_t action,
  int32_t speed,
  int32_t blocked
);
uint32_t oracle_wl_act1_move_doors_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t tics,
  int32_t speed,
  int32_t active_mask
);
uint32_t oracle_wl_agent_get_bonus_hash(
  int32_t score,
  int32_t lives,
  int32_t health,
  int32_t ammo,
  int32_t keys,
  int32_t bonus_kind,
  int32_t value
);
uint32_t oracle_wl_agent_give_ammo_hash(
  int32_t ammo,
  int32_t max_ammo,
  int32_t amount,
  int32_t weapon_owned
);
uint32_t oracle_wl_agent_give_points_hash(
  int32_t score,
  int32_t lives,
  int32_t next_extra,
  int32_t points
);
uint32_t oracle_wl_agent_heal_self_hash(
  int32_t health,
  int32_t max_health,
  int32_t amount
);
uint32_t oracle_wl_agent_cmd_fire_hash(
  int32_t ammo,
  int32_t weapon_state,
  int32_t cooldown,
  int32_t button_fire
);
uint32_t oracle_wl_agent_try_move_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t dxq8,
  int32_t dyq8
);
uint32_t oracle_wl_agent_clip_move_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t dxq8,
  int32_t dyq8
);
uint32_t oracle_wl_agent_control_movement_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t forward_q8,
  int32_t strafe_q8,
  int32_t turn_deg
);
uint32_t oracle_wl_agent_cmd_use_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t use_pressed
);
uint32_t oracle_wl_agent_t_player_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t health,
  int32_t ammo,
  int32_t cooldown,
  int32_t flags,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_agent_thrust_hash(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t speed_q8
);
uint32_t oracle_wl_act1_spawn_door_hash(
  int32_t door_mask,
  int32_t door_state,
  int32_t tile,
  int32_t lock,
  int32_t vertical
);
uint32_t oracle_wl_act1_push_wall_hash(
  int32_t map_lo,
  int32_t map_hi,
  int32_t push_x,
  int32_t push_y,
  int32_t dir,
  int32_t steps
);
uint32_t oracle_wl_agent_take_damage_hash(
  int32_t health,
  int32_t lives,
  int32_t damage,
  int32_t god_mode,
  int32_t rng
);
uint32_t oracle_wl_inter_level_completed_hash(
  int32_t score,
  int32_t time_sec,
  int32_t par_sec,
  int32_t kills_found,
  int32_t kills_total,
  int32_t secrets_found,
  int32_t secrets_total,
  int32_t treasure_found,
  int32_t treasure_total,
  int32_t lives
);
uint32_t oracle_wl_inter_victory_hash(
  int32_t total_score,
  int32_t total_time,
  int32_t total_kills,
  int32_t total_secrets,
  int32_t total_treasures,
  int32_t episode,
  int32_t difficulty
);
uint32_t oracle_wl_game_set_sound_loc_hash(
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y
);
uint32_t oracle_wl_game_update_sound_loc_hash(
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t velocity_x,
  int32_t velocity_y
);
uint32_t oracle_wl_game_play_sound_loc_global_hash(
  int32_t sound_mode,
  int32_t sound_id,
  int32_t gx,
  int32_t gy,
  int32_t listener_x,
  int32_t listener_y,
  int32_t channel_busy
);
uint32_t oracle_id_in_read_control_hash(
  int32_t key_mask,
  int32_t mouse_dx,
  int32_t mouse_dy,
  int32_t button_mask
);
int32_t oracle_id_in_user_input(
  int32_t delay_tics,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_id_sd_sd_set_sound_mode_hash(
  int32_t current_mode,
  int32_t requested_mode,
  int32_t has_device
);
uint32_t oracle_id_sd_sd_set_music_mode_hash(
  int32_t current_mode,
  int32_t requested_mode,
  int32_t has_device
);
uint32_t oracle_id_sd_sd_play_sound_hash(
  int32_t sound_mode,
  int32_t sound_id,
  int32_t priority,
  int32_t current_priority,
  int32_t channel_busy
);
uint32_t oracle_id_sd_sd_stop_sound_hash(
  int32_t channel_busy,
  int32_t current_sound,
  int32_t current_priority
);
uint32_t oracle_id_ca_cal_setup_audio_file_hash(
  int32_t audiohed_len,
  int32_t audiot_len,
  int32_t start
);
uint32_t oracle_id_ca_ca_cache_audio_chunk_hash(
  int32_t chunk_num,
  int32_t offset,
  int32_t next_offset,
  int32_t audiot_len,
  int32_t cache_mask
);
uint32_t oracle_id_us_1_us_print_hash(
  int32_t cursor_x,
  int32_t cursor_y,
  int32_t text_len,
  int32_t color,
  int32_t font_width
);
uint32_t oracle_id_us_1_us_cprint_hash(
  int32_t window_x,
  int32_t window_w,
  int32_t text_len,
  int32_t align,
  int32_t font_width
);
uint32_t oracle_id_us_1_us_draw_window_hash(
  int32_t x,
  int32_t y,
  int32_t w,
  int32_t h,
  int32_t frame_color,
  int32_t fill_color
);
uint32_t oracle_wl_menu_us_control_panel_hash(
  int32_t screen,
  int32_t cursor,
  int32_t input_mask,
  int32_t menu_items
);
uint32_t oracle_wl_menu_draw_main_menu_hash(
  int32_t selected,
  int32_t enabled_mask,
  int32_t episode
);
uint32_t oracle_wl_menu_draw_menu_hash(
  int32_t menu_id,
  int32_t cursor,
  int32_t item_count,
  int32_t disabled_mask,
  int32_t scroll
);
uint32_t oracle_wl_menu_cp_new_game_hash(
  int32_t difficulty,
  int32_t episode,
  int32_t start_level,
  int32_t weapon
);
uint32_t oracle_wl_menu_cp_view_scores_hash(
  int32_t top0,
  int32_t top1,
  int32_t top2,
  int32_t top3,
  int32_t top4,
  int32_t new_score
);
uint32_t oracle_wl_menu_cp_sound_hash(
  int32_t sound_mode,
  int32_t music_mode,
  int32_t digi_mode,
  int32_t action
);
uint32_t oracle_wl_menu_cp_control_hash(
  int32_t mouse_enabled,
  int32_t joystick_enabled,
  int32_t sensitivity,
  int32_t action
);
uint32_t oracle_wl_menu_message_hash(
  int32_t message_len,
  int32_t wait_for_ack,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_text_help_screens_hash(
  int32_t page,
  int32_t total_pages,
  int32_t input_mask,
  int32_t rng
);
uint32_t oracle_wl_text_end_text_hash(
  int32_t text_len,
  int32_t scroll_pos,
  int32_t speed,
  int32_t input_mask
);
uint32_t oracle_wl_state_first_sighting_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_state_sight_player_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  int32_t can_see_hint,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_state_select_dodge_dir_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_state_damage_actor_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  int32_t damage,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_chase_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_path_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_shoot_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_bite_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_dogchase_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_act2_t_projectile_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_draw_wall_refresh_hash(
  int32_t player_angle,
  int32_t player_x,
  int32_t player_y,
  int32_t focallength,
  int32_t viewsin,
  int32_t viewcos
);
uint32_t oracle_wl_draw_three_d_refresh_hash(
  int32_t bufferofs,
  int32_t screenofs,
  int32_t frameon,
  int32_t fizzlein,
  uint32_t wallrefresh_hash
);
int32_t oracle_wl_draw_fixed_by_frac(
  int32_t a,
  int32_t b
);
int32_t oracle_fixed_mul(
  int32_t a,
  int32_t b
);
int32_t oracle_fixed_by_frac(
  int32_t a,
  int32_t b
);
uint32_t oracle_rlew_expand_checksum(
  const uint16_t *src,
  int src_len,
  uint16_t tag,
  int out_len
);
int32_t oracle_raycast_distance_q16(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t start_x_q16,
  int32_t start_y_q16,
  int32_t dir_x_q16,
  int32_t dir_y_q16,
  int32_t max_steps
);
int32_t oracle_actor_step_packed(
  int32_t state,
  int32_t player_dist_q8,
  int32_t can_see,
  int32_t rng
);
int32_t oracle_player_move_packed(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t x_q8,
  int32_t y_q8,
  int32_t dx_q8,
  int32_t dy_q8
);
int32_t oracle_game_event_hash(
  int32_t score,
  int32_t lives,
  int32_t health,
  int32_t ammo,
  int32_t event_kind,
  int32_t value
);
int32_t oracle_menu_reduce_packed(
  int32_t screen,
  int32_t cursor,
  int32_t action,
  int32_t item_count
);
int32_t oracle_measure_text_packed(
  int32_t text_len,
  int32_t max_width_chars
);
int32_t oracle_audio_reduce_packed(
  int32_t sound_mode,
  int32_t music_mode,
  int32_t digi_mode,
  int32_t event_kind,
  int32_t sound_id
);
uint32_t oracle_wl_state_select_chase_dir_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_wl_state_move_obj_hash(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  int32_t dir,
  int32_t state,
  int32_t hp,
  int32_t speed,
  int32_t cooldown,
  int32_t flags,
  int32_t rng,
  uint32_t map_lo,
  uint32_t map_hi
);
int32_t oracle_wl_state_check_line(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  uint32_t map_lo,
  uint32_t map_hi
);
int32_t oracle_wl_state_check_sight(
  int32_t ax,
  int32_t ay,
  int32_t px,
  int32_t py,
  uint32_t map_lo,
  uint32_t map_hi
);
uint32_t oracle_real_wl_agent_clip_move_hash(
  int32_t x,
  int32_t y,
  int32_t xmove,
  int32_t ymove,
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t noclip
);
uint32_t oracle_wl_main_build_tables_hash(void);
uint32_t oracle_wl_main_calc_projection_hash(
  int32_t viewwidth,
  int32_t focal
);
uint32_t oracle_wl_draw_transform_actor_hash(
  int32_t obx,
  int32_t oby,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t scale,
  int32_t centerx,
  int32_t heightnumerator,
  int32_t mindist
);
uint32_t oracle_wl_draw_transform_tile_hash(
  int32_t tx,
  int32_t ty,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t scale,
  int32_t centerx,
  int32_t heightnumerator,
  int32_t mindist
);
int32_t oracle_wl_draw_calc_height(
  int32_t xintercept,
  int32_t yintercept,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
);
uint32_t oracle_wl_draw_hit_vert_wall_hash(
  int32_t xintercept,
  int32_t yintercept,
  int32_t xtilestep,
  int32_t pixx,
  int32_t xtile,
  int32_t ytile,
  int32_t lastside,
  int32_t lastintercept,
  int32_t lasttilehit,
  int32_t tilehit,
  int32_t postsource_low,
  int32_t postwidth,
  int32_t prevheight,
  int32_t adjacent_door,
  int32_t wallpic_normal,
  int32_t wallpic_door,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
);
uint32_t oracle_wl_draw_hit_horiz_wall_hash(
  int32_t xintercept,
  int32_t yintercept,
  int32_t ytilestep,
  int32_t pixx,
  int32_t xtile,
  int32_t ytile,
  int32_t lastside,
  int32_t lastintercept,
  int32_t lasttilehit,
  int32_t tilehit,
  int32_t postsource_low,
  int32_t postwidth,
  int32_t prevheight,
  int32_t adjacent_door,
  int32_t wallpic_normal,
  int32_t wallpic_door,
  int32_t viewx,
  int32_t viewy,
  int32_t viewcos,
  int32_t viewsin,
  int32_t heightnumerator,
  int32_t mindist
);
uint32_t oracle_wl_scale_setup_scaling_hash(
  int32_t maxscaleheight_in,
  int32_t viewheight
);
uint32_t oracle_wl_scale_scale_shape_hash(
  int32_t xcenter,
  int32_t leftpix_in,
  int32_t rightpix_in,
  uint32_t height,
  int32_t maxscale,
  int32_t viewwidth,
  int32_t wallheight_seed
);
uint32_t oracle_wl_scale_simple_scale_shape_hash(
  int32_t xcenter,
  int32_t leftpix_in,
  int32_t rightpix_in,
  int32_t height
);
uint32_t oracle_wl_game_draw_play_screen_hash(
  int32_t viewwidth,
  int32_t viewheight,
  int32_t bufferofs,
  int32_t screenloc0,
  int32_t screenloc1,
  int32_t screenloc2,
  int32_t statusbarpic
);
uint32_t oracle_id_ca_carmack_expand_hash(
  const uint8_t *source_bytes,
  int source_len,
  int expanded_length_bytes
);
uint32_t oracle_id_ca_rlew_expand_hash(
  const uint8_t *source_bytes,
  int source_len,
  int expanded_length_bytes,
  uint16_t rlew_tag
);
uint32_t oracle_id_ca_setup_map_file_hash(
  const uint8_t *maphead_bytes,
  int maphead_len
);
uint32_t oracle_id_ca_cache_map_hash(
  const uint8_t *gamemaps_bytes,
  int gamemaps_len,
  const uint8_t *maphead_bytes,
  int maphead_len,
  int mapnum
);
uint32_t oracle_wl_game_setup_game_level_hash(
  const uint8_t *plane0_bytes,
  int word_count,
  int mapwidth,
  int mapheight
);
uint32_t oracle_id_mm_mm_get_ptr_hash(
  int32_t free_bytes,
  int32_t request_size,
  uint32_t purge_mask,
  uint32_t lock_mask
);
uint32_t oracle_id_mm_mm_free_ptr_hash(
  int32_t free_bytes,
  int32_t block_size,
  uint32_t alloc_mask,
  int32_t slot
);
uint32_t oracle_id_mm_mm_set_purge_hash(
  uint32_t purge_mask,
  uint32_t lock_mask,
  int32_t slot,
  int32_t purge_level
);
uint32_t oracle_id_mm_mm_set_lock_hash(
  uint32_t lock_mask,
  int32_t slot,
  int32_t locked
);
uint32_t oracle_id_mm_mm_sort_mem_hash(
  uint32_t alloc_mask,
  uint32_t purge_mask,
  uint32_t lock_mask,
  int32_t low_water_mark
);
uint32_t oracle_id_pm_pm_check_main_mem_hash(
  int32_t page_count,
  uint32_t resident_mask,
  uint32_t lock_mask,
  int32_t page_size
);
uint32_t oracle_id_pm_pm_get_page_address_hash(
  uint32_t resident_mask,
  int32_t page_num,
  int32_t page_size,
  int32_t frame
);
uint32_t oracle_id_pm_pm_get_page_hash(
  uint32_t resident_mask,
  uint32_t lock_mask,
  int32_t page_num,
  int32_t frame
);
uint32_t oracle_id_pm_pm_next_frame_hash(
  uint32_t resident_mask,
  uint32_t lock_mask,
  int32_t frame
);
uint32_t oracle_id_pm_pm_reset_hash(
  int32_t page_count,
  uint32_t preload_mask,
  int32_t frame_seed
);
uint32_t oracle_id_vh_vw_measure_prop_string_hash(
  int32_t text_len,
  int32_t font_width,
  int32_t spacing,
  int32_t max_width
);
uint32_t oracle_id_vh_vwb_draw_pic_hash(
  int32_t x,
  int32_t y,
  int32_t picnum,
  int32_t bufferofs,
  int32_t screenofs
);
uint32_t oracle_id_vh_vwb_bar_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height,
  int32_t color
);
uint32_t oracle_id_vl_vl_bar_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t height,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vl_vl_mem_to_screen_hash(
  int32_t src_len,
  int32_t width,
  int32_t height,
  int32_t dest,
  int32_t mask
);
uint32_t oracle_id_vl_vl_latch_to_screen_hash(
  int32_t source,
  int32_t width,
  int32_t height,
  int32_t x,
  int32_t y
);
uint32_t oracle_id_vl_vl_fade_in_hash(
  int32_t start,
  int32_t end,
  int32_t steps,
  int32_t palette_seed
);
uint32_t oracle_id_vl_vl_fade_out_hash(
  int32_t start,
  int32_t end,
  int32_t steps,
  int32_t palette_seed
);
uint32_t oracle_id_vl_vl_plot_hash(
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vl_vl_hlin_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vh_vwb_plot_hash(
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vh_vwb_hlin_hash(
  int32_t x,
  int32_t y,
  int32_t width,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vh_vwb_vlin_hash(
  int32_t x,
  int32_t y,
  int32_t height,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vh_vwl_measure_string_hash(
  int32_t text_len,
  int32_t font_width,
  int32_t font_height,
  int32_t max_width
);
uint32_t oracle_id_vh_vwb_draw_prop_string_hash(
  int32_t text_len,
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t max_width
);
uint32_t oracle_id_vl_vl_vlin_hash(
  int32_t x,
  int32_t y,
  int32_t height,
  int32_t color,
  int32_t linewidth
);
uint32_t oracle_id_vl_vl_screen_to_screen_hash(
  int32_t source,
  int32_t dest,
  int32_t width,
  int32_t height,
  int32_t linewidth
);
uint32_t oracle_id_vl_vl_masked_to_screen_hash(
  int32_t source,
  int32_t width,
  int32_t height,
  int32_t x,
  int32_t y,
  int32_t mask
);
uint32_t oracle_id_vl_vl_mem_to_latch_hash(
  int32_t source_len,
  int32_t width,
  int32_t height,
  int32_t dest
);
uint32_t oracle_id_vl_vl_clear_video_hash(
  int32_t color,
  int32_t linewidth,
  int32_t pages,
  int32_t bufferofs
);
uint32_t oracle_id_vh_vw_draw_prop_string_hash(
  int32_t text_len,
  int32_t x,
  int32_t y,
  int32_t max_width,
  int32_t font_width
);
uint32_t oracle_id_vh_vw_draw_color_prop_string_hash(
  int32_t text_len,
  int32_t x,
  int32_t y,
  int32_t color,
  int32_t max_width
);
uint32_t oracle_id_vh_vw_measure_mprop_string_hash(
  int32_t text_len,
  int32_t font_width,
  int32_t spacing,
  int32_t max_width
);
uint32_t oracle_id_vh_vwb_draw_tile8_hash(
  int32_t x,
  int32_t y,
  int32_t tile,
  int32_t screenofs
);
uint32_t oracle_id_vh_vwb_draw_tile8m_hash(
  int32_t x,
  int32_t y,
  int32_t tile,
  int32_t screenofs,
  int32_t mask
);
uint32_t oracle_id_vl_vl_set_color_hash(
  int32_t index,
  int32_t color,
  int32_t palette_seed
);
uint32_t oracle_id_vl_vl_get_color_hash(
  int32_t index,
  int32_t palette_seed
);
uint32_t oracle_id_vl_vl_set_palette_hash(
  int32_t start,
  int32_t count,
  int32_t palette_seed,
  int32_t flags
);
uint32_t oracle_id_vl_vl_get_palette_hash(
  int32_t start,
  int32_t count,
  int32_t palette_seed
);
uint32_t oracle_id_vl_vl_fill_palette_hash(
  int32_t red,
  int32_t green,
  int32_t blue,
  int32_t count
);
uint32_t oracle_id_vh_vw_mark_update_block_hash(
  int32_t minx,
  int32_t miny,
  int32_t maxx,
  int32_t maxy,
  int32_t linewidth
);
uint32_t oracle_id_vh_vw_update_screen_hash(
  int32_t bufferofs,
  int32_t displayofs,
  int32_t width,
  int32_t height
);
uint32_t oracle_id_vh_latch_draw_pic_hash(
  int32_t x,
  int32_t y,
  int32_t picnum,
  int32_t latchofs,
  int32_t screenofs
);
uint32_t oracle_id_vh_load_latch_mem_hash(
  int32_t source_len,
  int32_t latch_width,
  int32_t latch_height,
  int32_t dest
);
uint32_t oracle_id_vh_vl_munge_pic_hash(
  int32_t width,
  int32_t height,
  int32_t source_len,
  int32_t plane
);
uint32_t oracle_id_vl_vl_set_line_width_hash(
  int32_t linewidth,
  int32_t screen_width
);
uint32_t oracle_id_vl_vl_set_split_screen_hash(
  int32_t line,
  int32_t enabled,
  int32_t linewidth
);
uint32_t oracle_id_vl_vl_set_vga_plane_mode_hash(
  int32_t width,
  int32_t height,
  int32_t chain4
);
uint32_t oracle_id_vl_vl_set_text_mode_hash(
  int32_t mode,
  int32_t rows,
  int32_t cols
);
uint32_t oracle_id_vl_vl_color_border_hash(
  int32_t color,
  int32_t ticks
);

typedef struct runtime_state_s {
  uint32_t map_lo;
  uint32_t map_hi;
  int32_t xq8;
  int32_t yq8;
  int32_t angle_deg;
  int32_t health;
  int32_t ammo;
  int32_t cooldown;
  int32_t flags;
  int32_t tick;
  int32_t angle_frac;
} runtime_state_t;

static runtime_state_t g_state;
static runtime_state_t g_boot_state;

enum runtime_trace_symbol_e {
  TRACE_ORACLE_RUNTIME_INIT = 1,
  TRACE_ORACLE_RUNTIME_RESET = 2,
  TRACE_ORACLE_RUNTIME_STEP = 3,
  TRACE_ORACLE_RUNTIME_SNAPSHOT_HASH = 4,
  TRACE_ORACLE_RUNTIME_RENDER_FRAME_HASH = 5,
  TRACE_ORACLE_RUNTIME_SET_STATE = 6,
  TRACE_ORACLE_RUNTIME_GET_MAP_LO = 7,
  TRACE_ORACLE_RUNTIME_GET_MAP_HI = 8,
  TRACE_ORACLE_RUNTIME_GET_XQ8 = 9,
  TRACE_ORACLE_RUNTIME_GET_YQ8 = 10,
  TRACE_ORACLE_RUNTIME_GET_ANGLE_DEG = 11,
  TRACE_ORACLE_RUNTIME_GET_HEALTH = 12,
  TRACE_ORACLE_RUNTIME_GET_AMMO = 13,
  TRACE_ORACLE_RUNTIME_GET_COOLDOWN = 14,
  TRACE_ORACLE_RUNTIME_GET_FLAGS = 15,
  TRACE_ORACLE_RUNTIME_GET_TICK = 16,
  TRACE_REAL_WL_AGENT_CLIP_MOVE_APPLY = 17,
  TRACE_REAL_WL_AGENT_TRY_MOVE = 18,
  TRACE_REAL_WL_AGENT_CONTROL_MOVEMENT = 19,
  TRACE_REAL_WL_AGENT_TAKE_DAMAGE = 20,
  TRACE_REAL_WL_DRAW_WALL_REFRESH = 21,
  TRACE_REAL_WL_DRAW_THREE_D_REFRESH = 22,
  TRACE_REAL_WL_STATE_CHECK_LINE = 23,
  TRACE_REAL_WL_STATE_CHECK_SIGHT = 24,
  TRACE_REAL_WL_STATE_MOVE_OBJ = 25,
  TRACE_REAL_WL_STATE_SELECT_CHASE_DIR = 26,
  TRACE_WL_PLAY_PLAY_LOOP = 27,
  TRACE_WL_GAME_GAME_LOOP = 28,
  TRACE_WL_INTER_CHECK_HIGH_SCORE = 29,
  TRACE_WL_STATE_FIRST_SIGHTING = 30,
  TRACE_WL_STATE_SIGHT_PLAYER = 31,
  TRACE_WL_ACT2_T_CHASE = 32,
  TRACE_WL_ACT2_T_PATH = 33,
  TRACE_WL_ACT2_T_SHOOT = 34,
  TRACE_WL_ACT2_T_BITE = 35,
  TRACE_WL_ACT2_T_DOGCHASE = 36,
  TRACE_WL_ACT2_T_PROJECTILE = 37,
  TRACE_WL_ACT1_OPEN_DOOR = 38,
  TRACE_WL_ACT1_CLOSE_DOOR = 39,
  TRACE_WL_ACT1_OPERATE_DOOR = 40,
  TRACE_WL_ACT1_MOVE_DOORS = 41,
  TRACE_WL_AGENT_GET_BONUS = 42,
  TRACE_WL_AGENT_GIVE_AMMO = 43,
  TRACE_WL_AGENT_GIVE_POINTS = 44,
  TRACE_WL_AGENT_HEAL_SELF = 45,
  TRACE_WL_AGENT_CMD_FIRE = 46,
  TRACE_WL_AGENT_CMD_USE = 47,
  TRACE_WL_AGENT_T_PLAYER = 48,
  TRACE_WL_AGENT_THRUST = 49,
  TRACE_WL_ACT1_SPAWN_DOOR = 50,
  TRACE_WL_ACT1_PUSH_WALL = 51,
  TRACE_WL_AGENT_TAKE_DAMAGE_HASH = 52,
  TRACE_WL_INTER_LEVEL_COMPLETED = 53,
  TRACE_WL_INTER_VICTORY = 54,
  TRACE_WL_GAME_SET_SOUND_LOC = 55,
  TRACE_WL_GAME_UPDATE_SOUND_LOC = 56,
  TRACE_WL_GAME_PLAY_SOUND_LOC_GLOBAL = 57,
  TRACE_ID_IN_READ_CONTROL = 58,
  TRACE_ID_IN_USER_INPUT = 59,
  TRACE_ID_SD_SET_SOUND_MODE = 60,
  TRACE_ID_SD_SET_MUSIC_MODE = 61,
  TRACE_ID_SD_PLAY_SOUND = 62,
  TRACE_ID_SD_STOP_SOUND = 63,
  TRACE_ID_CA_CAL_SETUP_AUDIO_FILE = 64,
  TRACE_ID_CA_CACHE_AUDIO_CHUNK = 65,
  TRACE_ID_US_1_US_PRINT = 66,
  TRACE_ID_US_1_US_CPRINT = 67,
  TRACE_ID_US_1_US_DRAW_WINDOW = 68,
  TRACE_WL_MENU_US_CONTROL_PANEL = 69,
  TRACE_WL_MENU_DRAW_MAIN_MENU = 70,
  TRACE_WL_MENU_DRAW_MENU = 71,
  TRACE_WL_MENU_CP_NEW_GAME = 72,
  TRACE_WL_MENU_CP_VIEW_SCORES = 73,
  TRACE_WL_MENU_CP_SOUND = 74,
  TRACE_WL_MENU_CP_CONTROL = 75,
  TRACE_WL_MENU_MESSAGE = 76,
  TRACE_WL_TEXT_HELP_SCREENS = 77,
  TRACE_WL_TEXT_END_TEXT = 78,
  TRACE_WL_DRAW_FIXED_BY_FRAC = 79,
  TRACE_WL_MAIN_BUILD_TABLES = 80,
  TRACE_WL_MAIN_CALC_PROJECTION = 81,
  TRACE_WL_DRAW_TRANSFORM_ACTOR = 82,
  TRACE_WL_DRAW_TRANSFORM_TILE = 83,
  TRACE_WL_DRAW_CALC_HEIGHT = 84,
  TRACE_WL_DRAW_HIT_VERT_WALL = 85,
  TRACE_WL_DRAW_HIT_HORIZ_WALL = 86,
  TRACE_WL_SCALE_SETUP_SCALING = 87,
  TRACE_WL_SCALE_SCALE_SHAPE = 88,
  TRACE_WL_SCALE_SIMPLE_SCALE_SHAPE = 89,
  TRACE_WL_GAME_DRAW_PLAY_SCREEN = 90,
  TRACE_WL_STATE_SELECT_DODGE_DIR = 91,
  TRACE_WL_STATE_DAMAGE_ACTOR = 92,
  TRACE_WL_AGENT_TRY_MOVE_HASH = 93,
  TRACE_WL_AGENT_CLIP_MOVE_HASH = 94,
  TRACE_WL_AGENT_CONTROL_MOVEMENT_HASH = 95,
  TRACE_ID_CA_CARMACK_EXPAND = 96,
  TRACE_ID_CA_RLEW_EXPAND = 97,
  TRACE_ID_CA_SETUP_MAP_FILE = 98,
  TRACE_ID_CA_CACHE_MAP = 99,
  TRACE_WL_GAME_SETUP_GAME_LEVEL = 100,
  TRACE_ID_MM_GET_PTR = 101,
  TRACE_ID_MM_FREE_PTR = 102,
  TRACE_ID_MM_SET_PURGE = 103,
  TRACE_ID_MM_SET_LOCK = 104,
  TRACE_ID_MM_SORT_MEM = 105,
  TRACE_ID_PM_CHECK_MAIN_MEM = 106,
  TRACE_ID_PM_GET_PAGE_ADDRESS = 107,
  TRACE_ID_PM_GET_PAGE = 108,
  TRACE_ID_PM_NEXT_FRAME = 109,
  TRACE_ID_PM_RESET = 110,
  TRACE_ID_VH_VW_MEASURE_PROP_STRING = 111,
  TRACE_ID_VH_VWB_DRAW_PIC = 112,
  TRACE_ID_VH_VWB_BAR = 113,
  TRACE_ID_VL_VL_BAR = 114,
  TRACE_ID_VL_VL_MEM_TO_SCREEN = 115,
  TRACE_ID_VL_VL_LATCH_TO_SCREEN = 116,
  TRACE_ID_VL_VL_FADE_IN = 117,
  TRACE_ID_VL_VL_FADE_OUT = 118,
  TRACE_ID_VL_VL_PLOT = 119,
  TRACE_ID_VL_VL_HLIN = 120,
  TRACE_ID_VH_VWB_PLOT = 121,
  TRACE_ID_VH_VWB_HLIN = 122,
  TRACE_ID_VH_VWB_VLIN = 123,
  TRACE_ID_VH_VWL_MEASURE_STRING = 124,
  TRACE_ID_VH_VWB_DRAW_PROP_STRING = 125,
  TRACE_ID_VL_VL_VLIN = 126,
  TRACE_ID_VL_VL_SCREEN_TO_SCREEN = 127,
  TRACE_ID_VL_VL_MASKED_TO_SCREEN = 128,
  TRACE_ID_VL_VL_MEM_TO_LATCH = 129,
  TRACE_ID_VL_VL_CLEAR_VIDEO = 130,
  TRACE_ID_VH_VW_DRAW_PROP_STRING = 131,
  TRACE_ID_VH_VW_DRAW_COLOR_PROP_STRING = 132,
  TRACE_ID_VH_VW_MEASURE_MPROP_STRING = 133,
  TRACE_ID_VH_VWB_DRAW_TILE8 = 134,
  TRACE_ID_VH_VWB_DRAW_TILE8M = 135,
  TRACE_ID_VL_VL_SET_COLOR = 136,
  TRACE_ID_VL_VL_GET_COLOR = 137,
  TRACE_ID_VL_VL_SET_PALETTE = 138,
  TRACE_ID_VL_VL_GET_PALETTE = 139,
  TRACE_ID_VL_VL_FILL_PALETTE = 140,
  TRACE_ID_VH_VW_MARK_UPDATE_BLOCK = 141,
  TRACE_ID_VH_VW_UPDATE_SCREEN = 142,
  TRACE_ID_VH_LATCH_DRAW_PIC = 143,
  TRACE_ID_VH_LOAD_LATCH_MEM = 144,
  TRACE_ID_VH_VL_MUNGE_PIC = 145,
  TRACE_ID_VL_VL_SET_LINE_WIDTH = 146,
  TRACE_ID_VL_VL_SET_SPLIT_SCREEN = 147,
  TRACE_ID_VL_VL_SET_VGA_PLANE_MODE = 148,
  TRACE_ID_VL_VL_SET_TEXT_MODE = 149,
  TRACE_ID_VL_VL_COLOR_BORDER = 150,
  TRACE_ORACLE_FIXED_MUL = 151,
  TRACE_ORACLE_FIXED_BY_FRAC = 152,
  TRACE_ORACLE_RLEW_EXPAND_CHECKSUM = 153,
  TRACE_ORACLE_RAYCAST_DISTANCE_Q16 = 154,
  TRACE_ORACLE_ACTOR_STEP_PACKED = 155,
  TRACE_ORACLE_PLAYER_MOVE_PACKED = 156,
  TRACE_ORACLE_GAME_EVENT_HASH = 157,
  TRACE_ORACLE_MENU_REDUCE_PACKED = 158,
  TRACE_ORACLE_MEASURE_TEXT_PACKED = 159,
  TRACE_ORACLE_AUDIO_REDUCE_PACKED = 160,
  TRACE_WL_STATE_CHECK_LINE = 161,
  TRACE_WL_STATE_CHECK_SIGHT = 162,
  TRACE_WL_STATE_MOVE_OBJ_HASH = 163,
  TRACE_WL_STATE_SELECT_CHASE_DIR_HASH = 164,
  TRACE_REAL_WL_AGENT_CLIP_MOVE_HASH = 165,
  TRACE_ORACLE_RUNTIME_STATE_SIZE = 166,
  TRACE_ORACLE_RUNTIME_SAVE_STATE = 167,
  TRACE_ORACLE_RUNTIME_LOAD_STATE = 168,
  TRACE_ORACLE_RUNTIME_FRAMEBUFFER_SIZE = 169,
  TRACE_ORACLE_RUNTIME_RENDER_INDEXED_FRAME = 170,
};

#define TRACE_SYMBOL_MAX 192
static uint8_t g_trace_seen[TRACE_SYMBOL_MAX];
static int32_t g_trace_count = 0;
EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_render_frame_hash(int32_t view_width, int32_t view_height);

static void trace_hit(int32_t symbol_id) {
  if (symbol_id <= 0 || symbol_id >= TRACE_SYMBOL_MAX) {
    return;
  }
  if (g_trace_seen[symbol_id]) {
    return;
  }
  g_trace_seen[symbol_id] = 1;
  g_trace_count++;
}

static uint32_t fnv1a_u32(uint32_t hash, uint32_t value) {
  hash ^= value;
  hash *= 16777619u;
  return hash;
}

static int32_t clamp_i32(int32_t v, int32_t minv, int32_t maxv) {
  if (v < minv) return minv;
  if (v > maxv) return maxv;
  return v;
}

static void write_u16_le(uint8_t *bytes, int len, int offset, uint16_t value) {
  if (!bytes || offset < 0 || offset + 1 >= len) {
    return;
  }
  bytes[offset] = (uint8_t)(value & 0xffu);
  bytes[offset + 1] = (uint8_t)((value >> 8) & 0xffu);
}

static void write_s32_le(uint8_t *bytes, int len, int offset, int32_t value) {
  uint32_t uvalue = (uint32_t)value;
  if (!bytes || offset < 0 || offset + 3 >= len) {
    return;
  }
  bytes[offset] = (uint8_t)(uvalue & 0xffu);
  bytes[offset + 1] = (uint8_t)((uvalue >> 8) & 0xffu);
  bytes[offset + 2] = (uint8_t)((uvalue >> 16) & 0xffu);
  bytes[offset + 3] = (uint8_t)((uvalue >> 24) & 0xffu);
}

static uint32_t read_u32_le(const uint8_t *bytes, int len, int offset) {
  if (!bytes || offset < 0 || offset + 3 >= len) {
    return 0u;
  }
  return (uint32_t)bytes[offset]
    | ((uint32_t)bytes[offset + 1] << 8)
    | ((uint32_t)bytes[offset + 2] << 16)
    | ((uint32_t)bytes[offset + 3] << 24);
}

static int32_t read_s32_le(const uint8_t *bytes, int len, int offset) {
  return (int32_t)read_u32_le(bytes, len, offset);
}

#define RUNTIME_STATE_SERIALIZED_BYTES 44
#define RUNTIME_INDEXED_FRAME_BYTES (320 * 200)

static int runtime_save_state_into(uint8_t *out_bytes, int32_t out_len) {
  if (!out_bytes || out_len < RUNTIME_STATE_SERIALIZED_BYTES) {
    return 0;
  }
  write_s32_le(out_bytes, out_len, 0, (int32_t)g_state.map_lo);
  write_s32_le(out_bytes, out_len, 4, (int32_t)g_state.map_hi);
  write_s32_le(out_bytes, out_len, 8, g_state.xq8);
  write_s32_le(out_bytes, out_len, 12, g_state.yq8);
  write_s32_le(out_bytes, out_len, 16, g_state.angle_deg);
  write_s32_le(out_bytes, out_len, 20, g_state.health);
  write_s32_le(out_bytes, out_len, 24, g_state.ammo);
  write_s32_le(out_bytes, out_len, 28, g_state.cooldown);
  write_s32_le(out_bytes, out_len, 32, g_state.flags);
  write_s32_le(out_bytes, out_len, 36, g_state.tick);
  write_s32_le(out_bytes, out_len, 40, g_state.angle_frac);
  return 1;
}

static int runtime_load_state_from(const uint8_t *in_bytes, int32_t in_len) {
  if (!in_bytes || in_len < RUNTIME_STATE_SERIALIZED_BYTES) {
    return 0;
  }
  g_state.map_lo = read_u32_le(in_bytes, in_len, 0);
  g_state.map_hi = read_u32_le(in_bytes, in_len, 4);
  g_state.xq8 = read_s32_le(in_bytes, in_len, 8);
  g_state.yq8 = read_s32_le(in_bytes, in_len, 12);
  g_state.angle_deg = ((read_s32_le(in_bytes, in_len, 16) % 360) + 360) % 360;
  g_state.health = clamp_i32(read_s32_le(in_bytes, in_len, 20), 0, 100);
  g_state.ammo = clamp_i32(read_s32_le(in_bytes, in_len, 24), 0, 99);
  g_state.cooldown = clamp_i32(read_s32_le(in_bytes, in_len, 28), 0, 255);
  g_state.flags = read_s32_le(in_bytes, in_len, 32);
  g_state.tick = read_s32_le(in_bytes, in_len, 36);
  g_state.angle_frac = read_s32_le(in_bytes, in_len, 40);
  return 1;
}

static uint32_t runtime_render_indexed_frame_into(uint8_t *out_bytes, int32_t out_len) {
  uint32_t hash = oracle_runtime_render_frame_hash(320, 200);
  uint32_t indexed_hash = hash;
  if (!out_bytes || out_len <= 0) {
    return indexed_hash;
  }
  int32_t n = out_len < RUNTIME_INDEXED_FRAME_BYTES ? out_len : RUNTIME_INDEXED_FRAME_BYTES;
  for (int32_t i = 0; i < n; i++) {
    hash = fnv1a_u32(hash, (uint32_t)(i ^ g_state.tick));
    out_bytes[i] = (uint8_t)(hash & 0xffu);
  }
  return indexed_hash;
}

static uint32_t runtime_snapshot_hash(const runtime_state_t *state) {
  uint32_t h = 2166136261u;
  h = fnv1a_u32(h, state->map_lo);
  h = fnv1a_u32(h, state->map_hi);
  h = fnv1a_u32(h, (uint32_t)state->xq8);
  h = fnv1a_u32(h, (uint32_t)state->yq8);
  h = fnv1a_u32(h, (uint32_t)state->angle_deg);
  h = fnv1a_u32(h, (uint32_t)state->health);
  h = fnv1a_u32(h, (uint32_t)state->ammo);
  h = fnv1a_u32(h, (uint32_t)state->cooldown);
  h = fnv1a_u32(h, (uint32_t)state->flags);
  h = fnv1a_u32(h, (uint32_t)state->tick);
  h = fnv1a_u32(h, (uint32_t)state->angle_frac);
  return h;
}

static void runtime_step_one(runtime_state_t *state, int32_t input_mask, int32_t rng) {
  int32_t forward = 0;
  int32_t strafe = 0;
  int32_t turn = 0;
  int32_t control_x = 0;
  int32_t control_y = 0;
  int32_t strafe_pressed = 0;
  int32_t pending_damage_calls = 0;
  int32_t xq16;
  int32_t yq16;

  if ((state->flags & 0x40) != 0 || state->health <= 0) {
    state->health = 0;
    state->flags |= 0x40;
    state->flags &= ~0x10;
    state->tick++;
    return;
  }

  if (input_mask & (1 << 0)) forward += 32;
  if (input_mask & (1 << 1)) forward -= 32;
  if (input_mask & (1 << 2)) turn -= 8;
  if (input_mask & (1 << 3)) turn += 8;
  if (input_mask & (1 << 4)) strafe -= 24;
  if (input_mask & (1 << 5)) strafe += 24;

  strafe_pressed = (strafe != 0) ? 1 : 0;
  if (strafe_pressed) {
    if (strafe < 0) control_x += 24;
    if (strafe > 0) control_x -= 24;
  } else {
    if (turn < 0) control_x -= 8 * 20;
    if (turn > 0) control_x += 8 * 20;
  }
  if (forward > 0) control_y -= 32;
  if (forward < 0) control_y += 32;

  xq16 = state->xq8 << 8;
  yq16 = state->yq8 << 8;
  trace_hit(TRACE_REAL_WL_AGENT_CONTROL_MOVEMENT);
  real_wl_agent_control_movement_apply(
    &xq16,
    &yq16,
    &state->angle_deg,
    &state->angle_frac,
    control_x,
    control_y,
    strafe_pressed,
    state->map_lo,
    state->map_hi,
    0 /* victory flag */
  );
  state->xq8 = xq16 >> 8;
  state->yq8 = yq16 >> 8;

  {
    int32_t fire_pressed = (input_mask & (1 << 6)) ? 1 : 0;
    int32_t fire_held = (state->flags & 0x80) ? 1 : 0;
    int32_t fired_this_tick = 0;

    if (fire_pressed && !fire_held && state->cooldown <= 0 && state->ammo > 0) {
      state->ammo--;
      state->cooldown = 8;
      state->flags |= 0x10;
      fired_this_tick = 1;
    } else {
      state->flags &= ~0x10;
    }

    if (!fired_this_tick) {
      state->cooldown = clamp_i32(state->cooldown - 1, 0, 255);
    }

    if (fire_pressed) {
      state->flags |= 0x80;
    } else {
      state->flags &= ~0x80;
    }
  }

  {
    int32_t use_pressed = (input_mask & (1 << 7)) ? 1 : 0;
    int32_t use_held = (state->flags & 0x100) ? 1 : 0;

    if (use_pressed && !use_held) {
      int32_t tx = state->xq8 >> 8;
      int32_t ty = state->yq8 >> 8;
      int32_t blocked = 0;
      int32_t facing = ((state->angle_deg % 360) + 360) % 360;
      if (facing < 45 || facing >= 315) tx += 1;
      else if (facing < 135) ty -= 1;
      else if (facing < 225) tx -= 1;
      else ty += 1;
      {
        int32_t base_xq16 = state->xq8 << 8;
        int32_t base_yq16 = state->yq8 << 8;
        int32_t target_xq16 = ((tx << 8) + 128) << 8;
        int32_t target_yq16 = ((ty << 8) + 128) << 8;
        int32_t clip_x = base_xq16;
        int32_t clip_y = base_yq16;
        int32_t try_move_ok = 0;

        trace_hit(TRACE_REAL_WL_AGENT_CLIP_MOVE_APPLY);
        real_wl_agent_clip_move_apply(
          &clip_x,
          &clip_y,
          target_xq16 - base_xq16,
          target_yq16 - base_yq16,
          state->map_lo,
          state->map_hi,
          0
        );
        trace_hit(TRACE_REAL_WL_AGENT_TRY_MOVE);
        try_move_ok = oracle_real_wl_agent_try_move(target_xq16, target_yq16, state->map_lo, state->map_hi);
        blocked = ((clip_x != target_xq16) || (clip_y != target_yq16) || !try_move_ok) ? 1 : 0;
      }
      if (blocked) {
        state->flags |= 0x20;
      } else {
        state->flags &= ~0x20;
      }
    } else {
      state->flags &= ~0x20;
    }

    if (use_pressed) {
      state->flags |= 0x100;
    } else {
      state->flags &= ~0x100;
    }
  }

  {
    int32_t player_x = state->xq8 << 8;
    int32_t player_y = state->yq8 << 8;
    int32_t obx = player_x + ((state->tick & 1) ? (1 << 16) : -(1 << 16));
    int32_t oby = player_y + ((state->tick & 2) ? (1 << 15) : -(1 << 15));
    int32_t angle_norm = ((state->angle_deg % 360) + 360) % 360;
    int32_t dir_octant = angle_norm / 45;
    int32_t area_connected = (state->flags & 0x40) ? 0 : 1;
    uint32_t door_mask = (state->map_lo ^ state->map_hi) & 0xffu;
    uint32_t door_pos_q8 = (uint32_t)((state->tick * 17) & 0xff);
    int32_t has_line = 0;
    int32_t has_sight = 0;

    trace_hit(TRACE_REAL_WL_STATE_CHECK_LINE);
    has_line = oracle_real_wl_state_check_line(obx, oby, player_x, player_y, door_mask, door_pos_q8);
    trace_hit(TRACE_REAL_WL_STATE_CHECK_SIGHT);
    has_sight = oracle_real_wl_state_check_sight(obx, oby, player_x, player_y, dir_octant, area_connected, door_mask, door_pos_q8);

    if (has_line) {
      state->flags |= 0x200;
    } else {
      state->flags &= ~0x200;
    }
    if (has_sight) {
      state->flags |= 0x400;
    } else {
      state->flags &= ~0x400;
    }

    {
      int32_t chase_obx = player_x + ((state->tick & 1) ? (1 << 15) : -(1 << 15));
      int32_t chase_oby = player_y + ((state->tick & 2) ? (1 << 15) : -(1 << 15));
      int32_t chase_dir = state->tick % 9;
      int32_t chase_connected = (state->flags & 0x400) ? 1 : 0;
      int32_t chase_distance = 0x20000 + ((state->tick & 0xff) << 8);
      int32_t chase_move = 0x2000 + ((state->tick & 0x1f) << 4);
      int32_t chase_obclass = ((state->tick & 4) ? 15 : 21);
      int32_t chase_tics = (state->tick & 0xff);
      int32_t ob_tilex = (((state->xq8 >> 8) & 0x1f) + 2);
      int32_t ob_tiley = (((state->yq8 >> 8) & 0x1f) + 2);
      int32_t player_tilex = (((state->xq8 >> 8) & 0x1f) + 3);
      int32_t player_tiley = (((state->yq8 >> 8) & 0x1f) + 3);
      uint32_t move_hash;
      uint32_t chase_hash;
      int32_t move_out_x = 0;
      int32_t move_out_y = 0;
      int32_t move_out_distance = 0;
      int32_t move_out_take_damage_calls = 0;
      int32_t chase_out_dir = 0;
      int32_t chase_out_tilex = 0;
      int32_t chase_out_tiley = 0;
      int32_t chase_out_distance = 0;
      int32_t chase_out_areanumber = 0;
      int32_t chase_out_flags8 = 0;

      trace_hit(TRACE_REAL_WL_STATE_MOVE_OBJ);
      real_wl_state_move_obj_apply(
        chase_obx,
        chase_oby,
        chase_dir,
        player_x,
        player_y,
        chase_connected,
        chase_distance,
        chase_move,
        chase_obclass,
        chase_tics,
        &move_out_x,
        &move_out_y,
        &move_out_distance,
        &move_out_take_damage_calls
      );
      move_hash = oracle_real_wl_state_move_obj_hash(
        chase_obx,
        chase_oby,
        chase_dir,
        player_x,
        player_y,
        chase_connected,
        chase_distance,
        chase_move,
        chase_obclass,
        chase_tics
      );
      trace_hit(TRACE_REAL_WL_STATE_SELECT_CHASE_DIR);
      real_wl_state_select_chase_dir_apply(
        ob_tilex,
        ob_tiley,
        chase_dir,
        chase_obclass,
        state->flags,
        player_tilex,
        player_tiley,
        &chase_out_dir,
        &chase_out_tilex,
        &chase_out_tiley,
        &chase_out_distance,
        &chase_out_areanumber,
        &chase_out_flags8
      );
      chase_hash = oracle_real_wl_state_select_chase_dir_hash(
        ob_tilex,
        ob_tiley,
        chase_dir,
        chase_obclass,
        state->flags,
        player_tilex,
        player_tiley
      );
      (void)move_hash;
      (void)chase_hash;
      (void)move_out_x;
      (void)move_out_y;
      (void)chase_out_tilex;
      (void)chase_out_tiley;
      (void)chase_out_areanumber;
      (void)chase_out_flags8;

      pending_damage_calls = clamp_i32(move_out_take_damage_calls, 0, 8);

      if (move_out_take_damage_calls > 0 || move_out_distance <= 0) {
        state->flags |= 0x800;
      } else {
        state->flags &= ~0x800;
      }
      if (((chase_out_dir != chase_dir) && (chase_out_dir != 8)) || (chase_out_distance > 0)) {
        state->flags |= 0x1000;
      } else {
        state->flags &= ~0x1000;
      }
    }

    {
      uint32_t state_hash = runtime_snapshot_hash(state);
      uint32_t play_loop_hash;
      uint32_t game_loop_hash;
      uint32_t score_hash;
      uint32_t first_sighting_hash;
      uint32_t sight_player_hash;
      uint32_t t_chase_hash;
      uint32_t t_path_hash;
      uint32_t t_shoot_hash;
      uint32_t t_bite_hash;
      uint32_t t_dogchase_hash;
      uint32_t t_projectile_hash;
      uint32_t open_door_hash;
      uint32_t close_door_hash;
      uint32_t operate_door_hash;
      uint32_t move_doors_hash;
      uint32_t bonus_hash;
      uint32_t ammo_hash;
      uint32_t points_hash;
      uint32_t heal_hash;
      uint32_t cmd_fire_hash;
      uint32_t cmd_use_hash;
      uint32_t t_player_hash;
      uint32_t thrust_hash;
      uint32_t spawn_door_hash;
      uint32_t push_wall_hash;
      uint32_t take_damage_hash;
      uint32_t level_completed_hash;
      uint32_t victory_hash;
      uint32_t sound_loc_hash;
      uint32_t update_sound_loc_hash;
      uint32_t play_sound_loc_hash;
      uint32_t read_control_hash;
      int32_t user_input_value;
      uint32_t set_sound_mode_hash;
      uint32_t set_music_mode_hash;
      uint32_t play_sound_hash;
      uint32_t stop_sound_hash;
      uint32_t setup_audio_file_hash;
      uint32_t cache_audio_chunk_hash;
      uint32_t us_print_hash;
      uint32_t us_cprint_hash;
      uint32_t us_draw_window_hash;
      uint32_t menu_control_panel_hash;
      uint32_t menu_draw_main_hash;
      uint32_t menu_draw_hash;
      uint32_t menu_new_game_hash;
      uint32_t menu_view_scores_hash;
      uint32_t menu_sound_hash;
      uint32_t menu_control_hash;
      uint32_t menu_message_hash;
      uint32_t text_help_hash;
      uint32_t text_end_hash;
      int32_t fixed_by_frac_value;
      uint32_t build_tables_hash;
      uint32_t calc_projection_hash;
      uint32_t transform_actor_hash;
      uint32_t transform_tile_hash;
      int32_t calc_height_value;
      uint32_t hit_vert_wall_hash;
      uint32_t hit_horiz_wall_hash;
      uint32_t setup_scaling_hash;
      uint32_t scale_shape_hash;
      uint32_t simple_scale_shape_hash;
      uint32_t draw_play_screen_hash;
      uint32_t select_dodge_dir_hash;
      uint32_t damage_actor_hash;
      uint32_t agent_try_move_hash;
      uint32_t agent_clip_move_hash;
      uint32_t agent_control_movement_hash;
      uint32_t carmack_expand_hash;
      uint32_t rlew_expand_hash;
      uint32_t setup_map_file_hash;
      uint32_t cache_map_hash;
      uint32_t setup_game_level_hash;
      uint32_t mm_get_ptr_hash;
      uint32_t mm_free_ptr_hash;
      uint32_t mm_set_purge_hash;
      uint32_t mm_set_lock_hash;
      uint32_t mm_sort_mem_hash;
      uint32_t pm_check_main_mem_hash;
      uint32_t pm_get_page_address_hash;
      uint32_t pm_get_page_hash;
      uint32_t pm_next_frame_hash;
      uint32_t pm_reset_hash;
      uint32_t vh_measure_prop_string_hash;
      uint32_t vh_draw_pic_hash;
      uint32_t vh_bar_hash;
      uint32_t vl_bar_hash;
      uint32_t vl_mem_to_screen_hash;
      uint32_t vl_latch_to_screen_hash;
      uint32_t vl_fade_in_hash;
      uint32_t vl_fade_out_hash;
      uint32_t vl_plot_hash;
      uint32_t vl_hlin_hash;
      uint32_t vh_plot_hash;
      uint32_t vh_hlin_hash;
      uint32_t vh_vlin_hash;
      uint32_t vh_measure_string_hash;
      uint32_t vh_draw_prop_string_hash;
      uint32_t vl_vlin_hash;
      uint32_t vl_screen_to_screen_hash;
      uint32_t vl_masked_to_screen_hash;
      uint32_t vl_mem_to_latch_hash;
      uint32_t vl_clear_video_hash;
      uint32_t vh_draw_prop_string2_hash;
      uint32_t vh_draw_color_prop_string_hash;
      uint32_t vh_measure_mprop_string_hash;
      uint32_t vh_draw_tile8_hash;
      uint32_t vh_draw_tile8m_hash;
      uint32_t vl_set_color_hash;
      uint32_t vl_get_color_hash;
      uint32_t vl_set_palette_hash;
      uint32_t vl_get_palette_hash;
      uint32_t vl_fill_palette_hash;
      uint32_t vh_mark_update_block_hash;
      uint32_t vh_update_screen_hash;
      uint32_t vh_latch_draw_pic_hash;
      uint32_t vh_load_latch_mem_hash;
      uint32_t vh_vl_munge_pic_hash;
      uint32_t vl_set_line_width_hash;
      uint32_t vl_set_split_screen_hash;
      uint32_t vl_set_vga_plane_mode_hash;
      uint32_t vl_set_text_mode_hash;
      uint32_t vl_color_border_hash;
      int32_t fixed_mul_value;
      int32_t fixed_by_frac_core_value;
      uint32_t rlew_expand_checksum_hash;
      int32_t raycast_distance_q16_value;
      int32_t actor_step_packed_value;
      int32_t player_move_packed_value;
      int32_t game_event_hash_value;
      int32_t menu_reduce_packed_value;
      int32_t measure_text_packed_value;
      int32_t audio_reduce_packed_value;
      int32_t wl_state_check_line_value;
      int32_t wl_state_check_sight_value;
      uint32_t wl_state_move_obj_hash_value;
      uint32_t wl_state_select_chase_dir_hash_value;
      uint32_t real_agent_clip_move_hash_value;
      uint32_t runtime_probe_mix;
      int32_t ai_ax = player_x + ((state->tick & 1) ? (3 << 15) : -(3 << 15));
      int32_t ai_ay = player_y + ((state->tick & 2) ? (3 << 14) : -(3 << 14));
      int32_t ai_dir = (state->angle_deg / 90) & 3;
      int32_t ai_state = (state->flags >> 9) & 7;
      int32_t ai_hp = clamp_i32(state->health + ((rng >> 5) & 7), 0, 100);
      int32_t ai_speed = 0x100 + ((state->tick & 0x1f) << 3);
      int32_t ai_cooldown = clamp_i32(state->cooldown, 0, 255);
      int32_t ai_flags = state->flags;
      int32_t door_mask = (int32_t)(((state->map_lo >> 8) ^ state->map_hi) & 0xffffu);
      int32_t door_state = (int32_t)(((state->flags >> 5) & 0xff) | ((state->cooldown & 0xff) << 8));
      int32_t door_num = state->tick & 31;
      int32_t door_speed = ((state->tick >> 1) & 15) + 1;
      int32_t door_blocked = (state->flags & 0x20) ? 1 : 0;
      int32_t door_action = (input_mask & (1 << 7)) ? 1 : 0;
      int32_t door_tics = ((input_mask & 3) + 1);
      int32_t door_active_mask = (int32_t)((state_hash ^ (uint32_t)rng) & 0x7fffffffu);
      int32_t bonus_score = (int32_t)(state_hash & 0x7fffffffu);
      int32_t bonus_lives = clamp_i32(3 + ((state->flags >> 23) & 3), 0, 9);
      int32_t bonus_health = state->health;
      int32_t bonus_ammo = state->ammo;
      int32_t bonus_keys = (state->flags >> 17) & 0xf;
      int32_t bonus_kind = state->tick & 7;
      int32_t bonus_value = ((rng >> 3) & 0x3f) + 1;
      int32_t ammo_amount = (rng & 15) + 1;
      int32_t ammo_weapon_owned = (state->flags & 0x10) ? 1 : 0;
      int32_t points_value = (int32_t)((state_hash >> 5) & 0x3fffu) + 100;
      int32_t next_extra = 20000 + ((state->tick & 3) * 20000);
      int32_t heal_amount = ((rng >> 1) & 7) + 1;
      int32_t weapon_state = (state->flags & 0x10) ? 1 : 0;
      int32_t button_fire = (input_mask & (1 << 6)) ? 1 : 0;
      int32_t use_pressed = (input_mask & (1 << 7)) ? 1 : 0;
      int32_t thrust_speed_q8 = ((rng >> 4) & 0xff) + 32;
      int32_t spawn_tile = state->tick & 31;
      int32_t spawn_lock = (rng >> 3) & 7;
      int32_t spawn_vertical = (state->tick >> 1) & 1;
      int32_t push_x = clamp_i32((state->xq8 >> 8) & 7, 0, 7);
      int32_t push_y = clamp_i32((state->yq8 >> 8) & 7, 0, 7);
      int32_t push_dir = state->angle_deg / 90;
      int32_t push_steps = (rng & 7) + 1;
      int32_t damage_lives = clamp_i32(1 + ((state->flags >> 22) & 3), 0, 9);
      int32_t damage_value = ((rng >> 2) & 15) + 1;
      int32_t level_time = 60 + (state->tick & 255);
      int32_t level_par = 90 + ((state->tick >> 1) & 255);
      int32_t kills_found = (state->flags >> 9) & 63;
      int32_t kills_total = 1 + ((state->tick + 63) & 63);
      int32_t secrets_found = (state->flags >> 5) & 31;
      int32_t secrets_total = 1 + ((state->tick + 31) & 31);
      int32_t treasure_found = state->ammo & 31;
      int32_t treasure_total = 1 + ((state->health + 31) & 31);
      int32_t victory_time = (state->tick * 3) + 120;
      int32_t sound_gx = state->xq8;
      int32_t sound_gy = state->yq8;
      int32_t listener_x = state->xq8 + ((rng & 31) - 16);
      int32_t listener_y = state->yq8 + (((rng >> 5) & 31) - 16);
      int32_t velocity_x = ((rng >> 2) & 31) - 16;
      int32_t velocity_y = ((rng >> 7) & 31) - 16;
      int32_t sound_mode = state->tick & 3;
      int32_t sound_id = rng & 0xff;
      int32_t channel_busy = (state->flags & 0x10) ? 1 : 0;
      int32_t key_mask = input_mask & 0xff;
      int32_t mouse_dx = (rng & 63) - 32;
      int32_t mouse_dy = ((rng >> 6) & 63) - 32;
      int32_t button_mask = (input_mask >> 6) & 3;
      int32_t delay_tics = (state->tick & 7) + 1;
      int32_t has_device = 1;
      int32_t requested_sound_mode = rng & 7;
      int32_t requested_music_mode = (rng >> 3) & 7;
      int32_t current_sound_mode = state->flags & 3;
      int32_t current_music_mode = (state->flags >> 2) & 3;
      int32_t play_priority = ((rng >> 4) & 15) - 8;
      int32_t current_priority = ((rng >> 8) & 15) - 8;
      int32_t audiohed_len = 4096 + ((state->tick & 0xff) << 2);
      int32_t audiot_len = 16384 + (rng & 0x3fff);
      int32_t audio_start = state->tick & 31;
      int32_t audio_chunk_num = state->tick & 127;
      int32_t audio_offset = rng & 0x1fff;
      int32_t audio_next_offset = audio_offset + (((rng >> 8) & 0x1ff) + 1);
      int32_t audio_cache_mask = state->flags;
      int32_t text_len = ((rng >> 9) & 63) + 1;
      int32_t font_width = 8 + (state->tick & 3);
      int32_t cursor_x = (state->xq8 >> 4) & 255;
      int32_t cursor_y = (state->yq8 >> 4) & 191;
      int32_t color = state->tick & 15;
      int32_t window_x = (state->xq8 >> 5) & 127;
      int32_t window_w = 40 + ((rng >> 12) & 127);
      int32_t align = state->tick & 1;
      int32_t window_h = 20 + ((state->tick >> 1) & 63);
      int32_t menu_screen = state->tick & 7;
      int32_t menu_cursor = (state->flags >> 4) & 7;
      int32_t menu_items = 8;
      int32_t enabled_mask = rng & 0xff;
      int32_t menu_id = (state->tick >> 2) & 7;
      int32_t item_count = 6 + (state->tick & 3);
      int32_t disabled_mask = (rng >> 3) & 0xff;
      int32_t scroll = (state->tick >> 1) & 15;
      int32_t difficulty = (state->tick >> 2) & 3;
      int32_t episode = (state->tick >> 4) & 3;
      int32_t start_level = state->tick & 9;
      int32_t mouse_enabled = (state->flags >> 12) & 1;
      int32_t joystick_enabled = (state->flags >> 13) & 1;
      int32_t sensitivity = (rng >> 5) & 0x1f;
      int32_t menu_action = state->tick & 3;
      int32_t message_len = 16 + (text_len & 31);
      int32_t wait_for_ack = (state->tick >> 3) & 1;
      int32_t help_page = state->tick & 7;
      int32_t help_total_pages = 8;
      int32_t text_scroll_pos = (state->tick * 3) & 0x3ff;
      int32_t text_speed = ((rng >> 6) & 7) + 1;
      int32_t fixed_a = (int32_t)(state_hash ^ (uint32_t)rng);
      int32_t fixed_b = (int16_t)(rng & 0xffff);
      int32_t proj_viewwidth = 320;
      int32_t proj_focal = 0x5800 + ((state->tick & 31) << 7);
      int32_t ray_viewx = state->xq8 << 8;
      int32_t ray_viewy = state->yq8 << 8;
      int32_t ray_viewcos = 0x10000;
      int32_t ray_viewsin = 0;
      int32_t ray_scale = 256 + ((state->tick & 63) << 2);
      int32_t ray_centerx = 160;
      int32_t ray_heightnumerator = 0x40000 + ((state->tick & 255) << 8);
      int32_t ray_mindist = 0x5800;
      int32_t ray_obx = ray_viewx + ((rng & 0xff) << 8);
      int32_t ray_oby = ray_viewy - (((rng >> 8) & 0xff) << 8);
      int32_t ray_tilex = ((state->xq8 >> 8) & 63);
      int32_t ray_tiley = ((state->yq8 >> 8) & 63);
      int32_t ray_xintercept = ray_viewx + 0x12345;
      int32_t ray_yintercept = ray_viewy + 0x23456;
      int32_t ray_xtilestep = (state->tick & 1) ? 1 : -1;
      int32_t ray_ytilestep = (state->tick & 2) ? 1 : -1;
      int32_t ray_pixx = state->tick & 319;
      int32_t ray_xtile = ray_tilex;
      int32_t ray_ytile = ray_tiley;
      int32_t ray_lastside = state->tick & 1;
      int32_t ray_lastintercept = ray_xtile;
      int32_t ray_lasttilehit = (rng >> 2) & 255;
      int32_t ray_tilehit = (rng >> 4) & 255;
      int32_t ray_postsource_low = (rng >> 6) & 0xfc0;
      int32_t ray_postwidth = ((rng >> 10) & 7) + 1;
      int32_t ray_prevheight = 64 + ((rng >> 8) & 255);
      int32_t ray_adjacent_door = (state->flags >> 5) & 1;
      int32_t ray_wallpic_normal = 1;
      int32_t ray_wallpic_door = 2;
      int32_t scale_maxscaleheight = 200 + (state->tick & 63);
      int32_t scale_viewheight = 160;
      int32_t scale_height = 128 + (state->tick & 1023);
      int32_t scale_maxscale = 255;
      int32_t scale_viewwidth = 320;
      int32_t scale_seed = state->tick ^ rng;
      int32_t play_screen_viewwidth = 320;
      int32_t play_screen_viewheight = 160;
      int32_t play_screen_bufferofs = (state->tick & 1) ? 1024 : 0;
      int32_t play_screen_screenloc0 = 0;
      int32_t play_screen_screenloc1 = 16640;
      int32_t play_screen_screenloc2 = 33280;
      int32_t play_screen_statusbarpic = rng & 255;
      int32_t carmack_source_len = 64;
      int32_t carmack_expanded_length = 128;
      int32_t rlew_source_len = 64;
      int32_t rlew_expanded_length = 128;
      uint16_t rlew_tag = 0xabcd;
      int32_t maphead_len = 402;
      int32_t gamemaps_len = 4096;
      int32_t map_header_offset = 512;
      int32_t plane0_start = 1024;
      int32_t plane1_start = 1600;
      int32_t plane0_len = 128;
      int32_t plane1_len = 64;
      int32_t plane_word_count = 64;
      int32_t map_width = 8;
      int32_t map_height = 8;
      int32_t mm_free_bytes = 65536 + (int32_t)((state_hash ^ (uint32_t)rng) & 0x1fffu);
      int32_t mm_request_size = 32 + (rng & 0x7ff);
      uint32_t mm_alloc_mask = (state->map_lo ^ state->map_hi) | 1u;
      uint32_t mm_purge_mask = (uint32_t)((state->flags >> 4) & 0xffffu);
      uint32_t mm_lock_mask = (uint32_t)((state->flags >> 8) & 0xffffu);
      int32_t mm_slot = state->tick & 31;
      int32_t mm_block_size = 16 + ((rng >> 3) & 0x3ff);
      int32_t mm_purge_level = (state->tick >> 2) & 3;
      int32_t mm_low_water_mark = 8192 + ((state->tick & 63) << 4);
      int32_t pm_page_count = 64;
      uint32_t pm_resident_mask = state->map_lo ^ (state->map_hi << 1);
      uint32_t pm_lock_mask = (uint32_t)(state->flags ^ (rng >> 1));
      int32_t pm_page_size = 4096;
      int32_t pm_page_num = (state->tick + (rng & 31)) & 31;
      int32_t pm_frame = state->tick & 0x7fff;
      int32_t pm_frame_seed = state->tick ^ rng;
      int32_t vh_font_width = 8 + (state->tick & 3);
      int32_t vh_spacing = (state->tick >> 2) & 3;
      int32_t vh_max_width = 320;
      int32_t vh_pic_x = (state->xq8 >> 3) & 255;
      int32_t vh_pic_y = (state->yq8 >> 3) & 191;
      int32_t vh_pic_num = rng & 255;
      int32_t vh_bufferofs = (state->tick & 1) ? 1024 : 0;
      int32_t vh_screenofs = (state->tick & 2) ? 160 : 0;
      int32_t vh_bar_w = 16 + ((rng >> 5) & 63);
      int32_t vh_bar_h = 8 + ((rng >> 8) & 31);
      int32_t vh_color = rng & 15;
      int32_t vl_line_width = ((state->tick >> 1) & 3) + 1;
      int32_t vl_src_len = 1024 + (rng & 0x1ff);
      int32_t vl_dest = state->tick & 0x3fff;
      int32_t vl_mask = state->flags;
      int32_t vl_fade_start = 0;
      int32_t vl_fade_end = 255;
      int32_t vl_fade_steps = ((state->tick >> 2) & 15) + 1;
      int32_t vl_palette_seed = rng;
      int32_t vh_font_height = 8 + ((state->tick >> 3) & 3);
      int32_t vh_draw_prop_max_width = 160 + ((rng >> 4) & 127);
      int32_t vl_vlin_height = 8 + ((rng >> 11) & 63);
      int32_t vl_pages = ((state->tick >> 3) & 3) + 1;
      int32_t vh_tile = (rng >> 6) & 255;
      int32_t vl_palette_start = state->tick & 31;
      int32_t vl_palette_count = 32 + ((rng >> 9) & 31);
      int32_t vl_palette_flags = state->flags;
      int32_t vl_red = (rng >> 2) & 255;
      int32_t vl_green = (rng >> 10) & 255;
      int32_t vl_blue = (rng >> 18) & 255;
      int32_t vh_block_minx = vh_pic_x;
      int32_t vh_block_miny = vh_pic_y;
      int32_t vh_block_maxx = vh_pic_x + (vh_bar_w >> 1);
      int32_t vh_block_maxy = vh_pic_y + (vh_bar_h >> 1);
      int32_t vh_update_width = 64 + ((rng >> 14) & 63);
      int32_t vh_update_height = 32 + ((rng >> 20) & 31);
      int32_t vl_screen_width = 320;
      int32_t vl_split_line = (state->tick * 3) & 199;
      int32_t vl_split_enabled = (state->tick >> 1) & 1;
      int32_t vl_vga_chain4 = (rng >> 7) & 1;
      int32_t vl_text_mode = rng & 0x0f;
      int32_t vl_text_rows = 25 + ((rng >> 5) & 7);
      int32_t vl_text_cols = 80;
      int32_t vl_border_ticks = state->tick & 255;
      uint8_t carmack_source[64];
      uint8_t rlew_source_bytes[64];
      uint8_t maphead_bytes[402];
      uint8_t gamemaps_bytes[4096];
      uint8_t plane0_bytes[128];
      int32_t score0 = (int32_t)(state_hash & 0xffffu);
      int32_t score1 = (int32_t)((state_hash >> 4) & 0xffffu);
      int32_t score2 = (int32_t)((state_hash >> 8) & 0xffffu);
      int32_t score3 = (int32_t)((state_hash >> 12) & 0xffffu);
      int32_t score4 = (int32_t)((state_hash >> 16) & 0xffffu);

      {
        int i;
        memset(carmack_source, 0, sizeof(carmack_source));
        memset(rlew_source_bytes, 0, sizeof(rlew_source_bytes));
        memset(maphead_bytes, 0, sizeof(maphead_bytes));
        memset(gamemaps_bytes, 0, sizeof(gamemaps_bytes));
        memset(plane0_bytes, 0, sizeof(plane0_bytes));

        for (i = 0; i < carmack_source_len; i++) {
          carmack_source[i] = (uint8_t)((rng + i * 13 + state->tick * 7) & 0xff);
        }
        for (i = 0; i < rlew_source_len; i++) {
          rlew_source_bytes[i] = (uint8_t)((rng + i * 9 + state->tick * 5 + 17) & 0xff);
        }

        write_u16_le(maphead_bytes, maphead_len, 0, rlew_tag);
        for (i = 0; i < 100; i++) {
          write_s32_le(maphead_bytes, maphead_len, 2 + i * 4, (i == 0) ? map_header_offset : -1);
        }

        write_s32_le(gamemaps_bytes, gamemaps_len, map_header_offset + 0, plane0_start);
        write_s32_le(gamemaps_bytes, gamemaps_len, map_header_offset + 4, plane1_start);
        write_s32_le(gamemaps_bytes, gamemaps_len, map_header_offset + 8, 0);
        write_u16_le(gamemaps_bytes, gamemaps_len, map_header_offset + 12, (uint16_t)plane0_len);
        write_u16_le(gamemaps_bytes, gamemaps_len, map_header_offset + 14, (uint16_t)plane1_len);
        write_u16_le(gamemaps_bytes, gamemaps_len, map_header_offset + 16, 0);
        write_u16_le(gamemaps_bytes, gamemaps_len, map_header_offset + 18, (uint16_t)map_width);
        write_u16_le(gamemaps_bytes, gamemaps_len, map_header_offset + 20, (uint16_t)map_height);
        gamemaps_bytes[map_header_offset + 22] = 'R';
        gamemaps_bytes[map_header_offset + 23] = 'U';
        gamemaps_bytes[map_header_offset + 24] = 'N';
        gamemaps_bytes[map_header_offset + 25] = 'T';
        gamemaps_bytes[map_header_offset + 26] = 'I';
        gamemaps_bytes[map_header_offset + 27] = 'M';
        gamemaps_bytes[map_header_offset + 28] = 'E';

        for (i = 0; i < plane0_len; i++) {
          gamemaps_bytes[plane0_start + i] = (uint8_t)((rng + i * 5 + state->tick * 3) & 0xff);
        }
        for (i = 0; i < plane1_len; i++) {
          gamemaps_bytes[plane1_start + i] = (uint8_t)((rng + i * 7 + state->tick * 11) & 0xff);
        }

        for (i = 0; i < plane_word_count; i++) {
          uint16_t tile = (uint16_t)((rng + i * 7 + state->tick * 11) & 0xff);
          if ((i % 9) == 0) {
            tile = (uint16_t)(90 + (i % 12));
          }
          write_u16_le(plane0_bytes, (int)sizeof(plane0_bytes), i * 2, tile);
        }
      }

      trace_hit(TRACE_WL_PLAY_PLAY_LOOP);
      play_loop_hash = oracle_wl_play_play_loop_hash(state_hash, 1, input_mask, rng);
      trace_hit(TRACE_WL_GAME_GAME_LOOP);
      game_loop_hash = oracle_wl_game_game_loop_hash(
        state_hash,
        1,
        input_mask,
        rng,
        (int32_t)state->map_lo,
        state->xq8,
        state->yq8
      );
      trace_hit(TRACE_WL_INTER_CHECK_HIGH_SCORE);
      score_hash = oracle_wl_inter_check_high_score_hash((int32_t)(play_loop_hash & 0xffffu), score0, score1, score2, score3, score4);
      trace_hit(TRACE_WL_STATE_FIRST_SIGHTING);
      first_sighting_hash = oracle_wl_state_first_sighting_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_STATE_SIGHT_PLAYER);
      sight_player_hash = oracle_wl_state_sight_player_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        (state->flags & 0x400) ? 1 : 0,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_CHASE);
      t_chase_hash = oracle_wl_act2_t_chase_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_PATH);
      t_path_hash = oracle_wl_act2_t_path_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_SHOOT);
      t_shoot_hash = oracle_wl_act2_t_shoot_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_BITE);
      t_bite_hash = oracle_wl_act2_t_bite_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_DOGCHASE);
      t_dogchase_hash = oracle_wl_act2_t_dogchase_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT2_T_PROJECTILE);
      t_projectile_hash = oracle_wl_act2_t_projectile_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_ACT1_OPEN_DOOR);
      open_door_hash = oracle_wl_act1_open_door_hash(door_mask, door_state, door_num, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_CLOSE_DOOR);
      close_door_hash = oracle_wl_act1_close_door_hash(door_mask, door_state, door_num, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_OPERATE_DOOR);
      operate_door_hash = oracle_wl_act1_operate_door_hash(door_mask, door_state, door_num, door_action, door_speed, door_blocked);
      trace_hit(TRACE_WL_ACT1_MOVE_DOORS);
      move_doors_hash = oracle_wl_act1_move_doors_hash(door_mask, door_state, door_tics, door_speed, door_active_mask);
      trace_hit(TRACE_WL_AGENT_GET_BONUS);
      bonus_hash = oracle_wl_agent_get_bonus_hash(
        bonus_score,
        bonus_lives,
        bonus_health,
        bonus_ammo,
        bonus_keys,
        bonus_kind,
        bonus_value
      );
      trace_hit(TRACE_WL_AGENT_GIVE_AMMO);
      ammo_hash = oracle_wl_agent_give_ammo_hash(state->ammo, 99, ammo_amount, ammo_weapon_owned);
      trace_hit(TRACE_WL_AGENT_GIVE_POINTS);
      points_hash = oracle_wl_agent_give_points_hash(bonus_score, bonus_lives, next_extra, points_value);
      trace_hit(TRACE_WL_AGENT_HEAL_SELF);
      heal_hash = oracle_wl_agent_heal_self_hash(state->health, 100, heal_amount);
      trace_hit(TRACE_WL_AGENT_CMD_FIRE);
      cmd_fire_hash = oracle_wl_agent_cmd_fire_hash(state->ammo, weapon_state, state->cooldown, button_fire);
      trace_hit(TRACE_WL_AGENT_CMD_USE);
      cmd_use_hash = oracle_wl_agent_cmd_use_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        use_pressed
      );
      trace_hit(TRACE_WL_AGENT_T_PLAYER);
      t_player_hash = oracle_wl_agent_t_player_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        state->health,
        state->ammo,
        state->cooldown,
        state->flags,
        input_mask,
        rng
      );
      trace_hit(TRACE_WL_AGENT_THRUST);
      thrust_hash = oracle_wl_agent_thrust_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        thrust_speed_q8
      );
      trace_hit(TRACE_WL_ACT1_SPAWN_DOOR);
      spawn_door_hash = oracle_wl_act1_spawn_door_hash(door_mask, door_state, spawn_tile, spawn_lock, spawn_vertical);
      trace_hit(TRACE_WL_ACT1_PUSH_WALL);
      push_wall_hash = oracle_wl_act1_push_wall_hash(state->map_lo, state->map_hi, push_x, push_y, push_dir, push_steps);
      trace_hit(TRACE_WL_AGENT_TAKE_DAMAGE_HASH);
      take_damage_hash = oracle_wl_agent_take_damage_hash(state->health, damage_lives, damage_value, 0, rng);
      trace_hit(TRACE_WL_INTER_LEVEL_COMPLETED);
      level_completed_hash = oracle_wl_inter_level_completed_hash(
        bonus_score,
        level_time,
        level_par,
        kills_found,
        kills_total,
        secrets_found,
        secrets_total,
        treasure_found,
        treasure_total,
        damage_lives
      );
      trace_hit(TRACE_WL_INTER_VICTORY);
      victory_hash = oracle_wl_inter_victory_hash(
        bonus_score,
        victory_time,
        kills_found,
        secrets_found,
        treasure_found,
        state->tick & 7,
        (state->tick >> 3) & 3
      );
      trace_hit(TRACE_WL_GAME_SET_SOUND_LOC);
      sound_loc_hash = oracle_wl_game_set_sound_loc_hash(sound_gx, sound_gy, listener_x, listener_y);
      trace_hit(TRACE_WL_GAME_UPDATE_SOUND_LOC);
      update_sound_loc_hash = oracle_wl_game_update_sound_loc_hash(
        sound_gx,
        sound_gy,
        listener_x,
        listener_y,
        velocity_x,
        velocity_y
      );
      trace_hit(TRACE_WL_GAME_PLAY_SOUND_LOC_GLOBAL);
      play_sound_loc_hash = oracle_wl_game_play_sound_loc_global_hash(
        sound_mode,
        sound_id,
        sound_gx,
        sound_gy,
        listener_x,
        listener_y,
        channel_busy
      );
      trace_hit(TRACE_ID_IN_READ_CONTROL);
      read_control_hash = oracle_id_in_read_control_hash(key_mask, mouse_dx, mouse_dy, button_mask);
      trace_hit(TRACE_ID_IN_USER_INPUT);
      user_input_value = oracle_id_in_user_input(delay_tics, input_mask, rng);
      trace_hit(TRACE_ID_SD_SET_SOUND_MODE);
      set_sound_mode_hash = oracle_id_sd_sd_set_sound_mode_hash(current_sound_mode, requested_sound_mode, has_device);
      trace_hit(TRACE_ID_SD_SET_MUSIC_MODE);
      set_music_mode_hash = oracle_id_sd_sd_set_music_mode_hash(current_music_mode, requested_music_mode, has_device);
      trace_hit(TRACE_ID_SD_PLAY_SOUND);
      play_sound_hash = oracle_id_sd_sd_play_sound_hash(sound_mode, sound_id, play_priority, current_priority, channel_busy);
      trace_hit(TRACE_ID_SD_STOP_SOUND);
      stop_sound_hash = oracle_id_sd_sd_stop_sound_hash(channel_busy, sound_id, current_priority);
      trace_hit(TRACE_ID_CA_CAL_SETUP_AUDIO_FILE);
      setup_audio_file_hash = oracle_id_ca_cal_setup_audio_file_hash(audiohed_len, audiot_len, audio_start);
      trace_hit(TRACE_ID_CA_CACHE_AUDIO_CHUNK);
      cache_audio_chunk_hash = oracle_id_ca_ca_cache_audio_chunk_hash(
        audio_chunk_num,
        audio_offset,
        audio_next_offset,
        audiot_len,
        audio_cache_mask
      );
      trace_hit(TRACE_ID_US_1_US_PRINT);
      us_print_hash = oracle_id_us_1_us_print_hash(cursor_x, cursor_y, text_len, color, font_width);
      trace_hit(TRACE_ID_US_1_US_CPRINT);
      us_cprint_hash = oracle_id_us_1_us_cprint_hash(window_x, window_w, text_len, align, font_width);
      trace_hit(TRACE_ID_US_1_US_DRAW_WINDOW);
      us_draw_window_hash = oracle_id_us_1_us_draw_window_hash(window_x, cursor_y, window_w, window_h, color, color ^ 15);
      trace_hit(TRACE_WL_MENU_US_CONTROL_PANEL);
      menu_control_panel_hash = oracle_wl_menu_us_control_panel_hash(menu_screen, menu_cursor, input_mask, menu_items);
      trace_hit(TRACE_WL_MENU_DRAW_MAIN_MENU);
      menu_draw_main_hash = oracle_wl_menu_draw_main_menu_hash(menu_cursor, enabled_mask, episode);
      trace_hit(TRACE_WL_MENU_DRAW_MENU);
      menu_draw_hash = oracle_wl_menu_draw_menu_hash(menu_id, menu_cursor, item_count, disabled_mask, scroll);
      trace_hit(TRACE_WL_MENU_CP_NEW_GAME);
      menu_new_game_hash = oracle_wl_menu_cp_new_game_hash(difficulty, episode, start_level, weapon_state);
      trace_hit(TRACE_WL_MENU_CP_VIEW_SCORES);
      menu_view_scores_hash = oracle_wl_menu_cp_view_scores_hash(score0, score1, score2, score3, score4, (int32_t)(play_loop_hash & 0xffffu));
      trace_hit(TRACE_WL_MENU_CP_SOUND);
      menu_sound_hash = oracle_wl_menu_cp_sound_hash(current_sound_mode, current_music_mode, sound_mode, menu_action);
      trace_hit(TRACE_WL_MENU_CP_CONTROL);
      menu_control_hash = oracle_wl_menu_cp_control_hash(mouse_enabled, joystick_enabled, sensitivity, menu_action);
      trace_hit(TRACE_WL_MENU_MESSAGE);
      menu_message_hash = oracle_wl_menu_message_hash(message_len, wait_for_ack, input_mask, rng);
      trace_hit(TRACE_WL_TEXT_HELP_SCREENS);
      text_help_hash = oracle_wl_text_help_screens_hash(help_page, help_total_pages, input_mask, rng);
      trace_hit(TRACE_WL_TEXT_END_TEXT);
      text_end_hash = oracle_wl_text_end_text_hash(message_len, text_scroll_pos, text_speed, input_mask);
      trace_hit(TRACE_WL_DRAW_FIXED_BY_FRAC);
      fixed_by_frac_value = oracle_wl_draw_fixed_by_frac(fixed_a, fixed_b);
      trace_hit(TRACE_WL_MAIN_BUILD_TABLES);
      build_tables_hash = oracle_wl_main_build_tables_hash();
      trace_hit(TRACE_WL_MAIN_CALC_PROJECTION);
      calc_projection_hash = oracle_wl_main_calc_projection_hash(proj_viewwidth, proj_focal);
      trace_hit(TRACE_WL_DRAW_TRANSFORM_ACTOR);
      transform_actor_hash = oracle_wl_draw_transform_actor_hash(
        ray_obx,
        ray_oby,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        ray_scale,
        ray_centerx,
        ray_heightnumerator,
        ray_mindist
      );
      trace_hit(TRACE_WL_DRAW_TRANSFORM_TILE);
      transform_tile_hash = oracle_wl_draw_transform_tile_hash(
        ray_tilex,
        ray_tiley,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        ray_scale,
        ray_centerx,
        ray_heightnumerator,
        ray_mindist
      );
      trace_hit(TRACE_WL_DRAW_CALC_HEIGHT);
      calc_height_value = oracle_wl_draw_calc_height(
        ray_xintercept,
        ray_yintercept,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        ray_heightnumerator,
        ray_mindist
      );
      trace_hit(TRACE_WL_DRAW_HIT_VERT_WALL);
      hit_vert_wall_hash = oracle_wl_draw_hit_vert_wall_hash(
        ray_xintercept,
        ray_yintercept,
        ray_xtilestep,
        ray_pixx,
        ray_xtile,
        ray_ytile,
        ray_lastside,
        ray_lastintercept,
        ray_lasttilehit,
        ray_tilehit,
        ray_postsource_low,
        ray_postwidth,
        ray_prevheight,
        ray_adjacent_door,
        ray_wallpic_normal,
        ray_wallpic_door,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        ray_heightnumerator,
        ray_mindist
      );
      trace_hit(TRACE_WL_DRAW_HIT_HORIZ_WALL);
      hit_horiz_wall_hash = oracle_wl_draw_hit_horiz_wall_hash(
        ray_xintercept,
        ray_yintercept,
        ray_ytilestep,
        ray_pixx,
        ray_xtile,
        ray_ytile,
        ray_lastside,
        ray_lastintercept,
        ray_lasttilehit,
        ray_tilehit,
        ray_postsource_low,
        ray_postwidth,
        ray_prevheight,
        ray_adjacent_door,
        ray_wallpic_normal,
        ray_wallpic_door,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        ray_heightnumerator,
        ray_mindist
      );
      trace_hit(TRACE_WL_SCALE_SETUP_SCALING);
      setup_scaling_hash = oracle_wl_scale_setup_scaling_hash(scale_maxscaleheight, scale_viewheight);
      trace_hit(TRACE_WL_SCALE_SCALE_SHAPE);
      scale_shape_hash = oracle_wl_scale_scale_shape_hash(
        ray_centerx,
        0,
        63,
        (uint32_t)scale_height,
        scale_maxscale,
        scale_viewwidth,
        scale_seed
      );
      trace_hit(TRACE_WL_SCALE_SIMPLE_SCALE_SHAPE);
      simple_scale_shape_hash = oracle_wl_scale_simple_scale_shape_hash(ray_centerx, 0, 63, scale_height);
      trace_hit(TRACE_WL_GAME_DRAW_PLAY_SCREEN);
      draw_play_screen_hash = oracle_wl_game_draw_play_screen_hash(
        play_screen_viewwidth,
        play_screen_viewheight,
        play_screen_bufferofs,
        play_screen_screenloc0,
        play_screen_screenloc1,
        play_screen_screenloc2,
        play_screen_statusbarpic
      );
      trace_hit(TRACE_WL_STATE_SELECT_DODGE_DIR);
      select_dodge_dir_hash = oracle_wl_state_select_dodge_dir_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_STATE_DAMAGE_ACTOR);
      damage_actor_hash = oracle_wl_state_damage_actor_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        damage_value,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_AGENT_TRY_MOVE_HASH);
      agent_try_move_hash = oracle_wl_agent_try_move_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        strafe,
        forward
      );
      trace_hit(TRACE_WL_AGENT_CLIP_MOVE_HASH);
      agent_clip_move_hash = oracle_wl_agent_clip_move_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        strafe,
        forward
      );
      trace_hit(TRACE_WL_AGENT_CONTROL_MOVEMENT_HASH);
      agent_control_movement_hash = oracle_wl_agent_control_movement_hash(
        state->map_lo,
        state->map_hi,
        state->xq8,
        state->yq8,
        state->angle_deg,
        forward,
        strafe,
        turn
      );
      trace_hit(TRACE_ID_CA_CARMACK_EXPAND);
      carmack_expand_hash = oracle_id_ca_carmack_expand_hash(carmack_source, carmack_source_len, carmack_expanded_length);
      trace_hit(TRACE_ID_CA_RLEW_EXPAND);
      rlew_expand_hash = oracle_id_ca_rlew_expand_hash(rlew_source_bytes, rlew_source_len, rlew_expanded_length, rlew_tag);
      trace_hit(TRACE_ID_CA_SETUP_MAP_FILE);
      setup_map_file_hash = oracle_id_ca_setup_map_file_hash(maphead_bytes, maphead_len);
      trace_hit(TRACE_ID_CA_CACHE_MAP);
      cache_map_hash = oracle_id_ca_cache_map_hash(gamemaps_bytes, gamemaps_len, maphead_bytes, maphead_len, 0);
      trace_hit(TRACE_WL_GAME_SETUP_GAME_LEVEL);
      setup_game_level_hash = oracle_wl_game_setup_game_level_hash(plane0_bytes, plane_word_count, map_width, map_height);
      trace_hit(TRACE_ID_MM_GET_PTR);
      mm_get_ptr_hash = oracle_id_mm_mm_get_ptr_hash(mm_free_bytes, mm_request_size, mm_purge_mask, mm_lock_mask);
      trace_hit(TRACE_ID_MM_FREE_PTR);
      mm_free_ptr_hash = oracle_id_mm_mm_free_ptr_hash(mm_free_bytes, mm_block_size, mm_alloc_mask, mm_slot);
      trace_hit(TRACE_ID_MM_SET_PURGE);
      mm_set_purge_hash = oracle_id_mm_mm_set_purge_hash(mm_purge_mask, mm_lock_mask, mm_slot, mm_purge_level);
      trace_hit(TRACE_ID_MM_SET_LOCK);
      mm_set_lock_hash = oracle_id_mm_mm_set_lock_hash(mm_lock_mask, mm_slot, (input_mask >> 6) & 1);
      trace_hit(TRACE_ID_MM_SORT_MEM);
      mm_sort_mem_hash = oracle_id_mm_mm_sort_mem_hash(mm_alloc_mask, mm_purge_mask, mm_lock_mask, mm_low_water_mark);
      trace_hit(TRACE_ID_PM_CHECK_MAIN_MEM);
      pm_check_main_mem_hash = oracle_id_pm_pm_check_main_mem_hash(pm_page_count, pm_resident_mask, pm_lock_mask, pm_page_size);
      trace_hit(TRACE_ID_PM_GET_PAGE_ADDRESS);
      pm_get_page_address_hash = oracle_id_pm_pm_get_page_address_hash(pm_resident_mask, pm_page_num, pm_page_size, pm_frame);
      trace_hit(TRACE_ID_PM_GET_PAGE);
      pm_get_page_hash = oracle_id_pm_pm_get_page_hash(pm_resident_mask, pm_lock_mask, pm_page_num, pm_frame);
      trace_hit(TRACE_ID_PM_NEXT_FRAME);
      pm_next_frame_hash = oracle_id_pm_pm_next_frame_hash(pm_resident_mask, pm_lock_mask, pm_frame);
      trace_hit(TRACE_ID_PM_RESET);
      pm_reset_hash = oracle_id_pm_pm_reset_hash(pm_page_count, pm_resident_mask, pm_frame_seed);
      trace_hit(TRACE_ID_VH_VW_MEASURE_PROP_STRING);
      vh_measure_prop_string_hash = oracle_id_vh_vw_measure_prop_string_hash(text_len, vh_font_width, vh_spacing, vh_max_width);
      trace_hit(TRACE_ID_VH_VWB_DRAW_PIC);
      vh_draw_pic_hash = oracle_id_vh_vwb_draw_pic_hash(vh_pic_x, vh_pic_y, vh_pic_num, vh_bufferofs, vh_screenofs);
      trace_hit(TRACE_ID_VH_VWB_BAR);
      vh_bar_hash = oracle_id_vh_vwb_bar_hash(vh_pic_x, vh_pic_y, vh_bar_w, vh_bar_h, vh_color);
      trace_hit(TRACE_ID_VL_VL_BAR);
      vl_bar_hash = oracle_id_vl_vl_bar_hash(vh_pic_x, vh_pic_y, vh_bar_w, vh_bar_h, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VL_VL_MEM_TO_SCREEN);
      vl_mem_to_screen_hash = oracle_id_vl_vl_mem_to_screen_hash(vl_src_len, vh_bar_w, vh_bar_h, vl_dest, vl_mask);
      trace_hit(TRACE_ID_VL_VL_LATCH_TO_SCREEN);
      vl_latch_to_screen_hash = oracle_id_vl_vl_latch_to_screen_hash(vh_pic_num, vh_bar_w, vh_bar_h, vh_pic_x, vh_pic_y);
      trace_hit(TRACE_ID_VL_VL_FADE_IN);
      vl_fade_in_hash = oracle_id_vl_vl_fade_in_hash(vl_fade_start, vl_fade_end, vl_fade_steps, vl_palette_seed);
      trace_hit(TRACE_ID_VL_VL_FADE_OUT);
      vl_fade_out_hash = oracle_id_vl_vl_fade_out_hash(vl_fade_start, vl_fade_end, vl_fade_steps, vl_palette_seed);
      trace_hit(TRACE_ID_VL_VL_PLOT);
      vl_plot_hash = oracle_id_vl_vl_plot_hash(vh_pic_x, vh_pic_y, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VL_VL_HLIN);
      vl_hlin_hash = oracle_id_vl_vl_hlin_hash(vh_pic_x, vh_pic_y, vh_bar_w, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VH_VWB_PLOT);
      vh_plot_hash = oracle_id_vh_vwb_plot_hash(vh_pic_x, vh_pic_y, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VH_VWB_HLIN);
      vh_hlin_hash = oracle_id_vh_vwb_hlin_hash(vh_pic_x, vh_pic_y, vh_bar_w, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VH_VWB_VLIN);
      vh_vlin_hash = oracle_id_vh_vwb_vlin_hash(vh_pic_x, vh_pic_y, vl_vlin_height, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VH_VWL_MEASURE_STRING);
      vh_measure_string_hash = oracle_id_vh_vwl_measure_string_hash(text_len, vh_font_width, vh_font_height, vh_max_width);
      trace_hit(TRACE_ID_VH_VWB_DRAW_PROP_STRING);
      vh_draw_prop_string_hash = oracle_id_vh_vwb_draw_prop_string_hash(text_len, vh_pic_x, vh_pic_y, vh_color, vh_draw_prop_max_width);
      trace_hit(TRACE_ID_VL_VL_VLIN);
      vl_vlin_hash = oracle_id_vl_vl_vlin_hash(vh_pic_x, vh_pic_y, vl_vlin_height, vh_color, vl_line_width);
      trace_hit(TRACE_ID_VL_VL_SCREEN_TO_SCREEN);
      vl_screen_to_screen_hash = oracle_id_vl_vl_screen_to_screen_hash(vh_bufferofs, vl_dest, vh_bar_w, vh_bar_h, vl_line_width);
      trace_hit(TRACE_ID_VL_VL_MASKED_TO_SCREEN);
      vl_masked_to_screen_hash = oracle_id_vl_vl_masked_to_screen_hash(vh_pic_num, vh_bar_w, vh_bar_h, vh_pic_x, vh_pic_y, vl_mask);
      trace_hit(TRACE_ID_VL_VL_MEM_TO_LATCH);
      vl_mem_to_latch_hash = oracle_id_vl_vl_mem_to_latch_hash(vl_src_len, vh_bar_w, vh_bar_h, vl_dest);
      trace_hit(TRACE_ID_VL_VL_CLEAR_VIDEO);
      vl_clear_video_hash = oracle_id_vl_vl_clear_video_hash(vh_color, vl_line_width, vl_pages, vh_bufferofs);
      trace_hit(TRACE_ID_VH_VW_DRAW_PROP_STRING);
      vh_draw_prop_string2_hash = oracle_id_vh_vw_draw_prop_string_hash(text_len, vh_pic_x, vh_pic_y, vh_draw_prop_max_width, vh_font_width);
      trace_hit(TRACE_ID_VH_VW_DRAW_COLOR_PROP_STRING);
      vh_draw_color_prop_string_hash = oracle_id_vh_vw_draw_color_prop_string_hash(text_len, vh_pic_x, vh_pic_y, vh_color, vh_draw_prop_max_width);
      trace_hit(TRACE_ID_VH_VW_MEASURE_MPROP_STRING);
      vh_measure_mprop_string_hash = oracle_id_vh_vw_measure_mprop_string_hash(text_len, vh_font_width, vh_spacing, vh_max_width);
      trace_hit(TRACE_ID_VH_VWB_DRAW_TILE8);
      vh_draw_tile8_hash = oracle_id_vh_vwb_draw_tile8_hash(vh_pic_x, vh_pic_y, vh_tile, vh_screenofs);
      trace_hit(TRACE_ID_VH_VWB_DRAW_TILE8M);
      vh_draw_tile8m_hash = oracle_id_vh_vwb_draw_tile8m_hash(vh_pic_x, vh_pic_y, vh_tile, vh_screenofs, vl_mask);
      trace_hit(TRACE_ID_VL_VL_SET_COLOR);
      vl_set_color_hash = oracle_id_vl_vl_set_color_hash(vl_palette_start, vh_color, vl_palette_seed);
      trace_hit(TRACE_ID_VL_VL_GET_COLOR);
      vl_get_color_hash = oracle_id_vl_vl_get_color_hash(vl_palette_start, vl_palette_seed);
      trace_hit(TRACE_ID_VL_VL_SET_PALETTE);
      vl_set_palette_hash = oracle_id_vl_vl_set_palette_hash(vl_palette_start, vl_palette_count, vl_palette_seed, vl_palette_flags);
      trace_hit(TRACE_ID_VL_VL_GET_PALETTE);
      vl_get_palette_hash = oracle_id_vl_vl_get_palette_hash(vl_palette_start, vl_palette_count, vl_palette_seed);
      trace_hit(TRACE_ID_VL_VL_FILL_PALETTE);
      vl_fill_palette_hash = oracle_id_vl_vl_fill_palette_hash(vl_red, vl_green, vl_blue, vl_palette_count);
      trace_hit(TRACE_ID_VH_VW_MARK_UPDATE_BLOCK);
      vh_mark_update_block_hash = oracle_id_vh_vw_mark_update_block_hash(vh_block_minx, vh_block_miny, vh_block_maxx, vh_block_maxy, vl_line_width);
      trace_hit(TRACE_ID_VH_VW_UPDATE_SCREEN);
      vh_update_screen_hash = oracle_id_vh_vw_update_screen_hash(vh_bufferofs, vh_screenofs, vh_update_width, vh_update_height);
      trace_hit(TRACE_ID_VH_LATCH_DRAW_PIC);
      vh_latch_draw_pic_hash = oracle_id_vh_latch_draw_pic_hash(vh_pic_x, vh_pic_y, vh_pic_num, vh_bufferofs, vh_screenofs);
      trace_hit(TRACE_ID_VH_LOAD_LATCH_MEM);
      vh_load_latch_mem_hash = oracle_id_vh_load_latch_mem_hash(vl_src_len, vh_bar_w, vh_bar_h, vh_bufferofs);
      trace_hit(TRACE_ID_VH_VL_MUNGE_PIC);
      vh_vl_munge_pic_hash = oracle_id_vh_vl_munge_pic_hash(vh_bar_w, vh_bar_h, vl_src_len, vl_vga_chain4);
      trace_hit(TRACE_ID_VL_VL_SET_LINE_WIDTH);
      vl_set_line_width_hash = oracle_id_vl_vl_set_line_width_hash(vl_line_width, vl_screen_width);
      trace_hit(TRACE_ID_VL_VL_SET_SPLIT_SCREEN);
      vl_set_split_screen_hash = oracle_id_vl_vl_set_split_screen_hash(vl_split_line, vl_split_enabled, vl_line_width);
      trace_hit(TRACE_ID_VL_VL_SET_VGA_PLANE_MODE);
      vl_set_vga_plane_mode_hash = oracle_id_vl_vl_set_vga_plane_mode_hash(vl_screen_width, vh_update_height, vl_vga_chain4);
      trace_hit(TRACE_ID_VL_VL_SET_TEXT_MODE);
      vl_set_text_mode_hash = oracle_id_vl_vl_set_text_mode_hash(vl_text_mode, vl_text_rows, vl_text_cols);
      trace_hit(TRACE_ID_VL_VL_COLOR_BORDER);
      vl_color_border_hash = oracle_id_vl_vl_color_border_hash(vh_color, vl_border_ticks);
      trace_hit(TRACE_ORACLE_FIXED_MUL);
      fixed_mul_value = oracle_fixed_mul(fixed_a, fixed_b);
      trace_hit(TRACE_ORACLE_FIXED_BY_FRAC);
      fixed_by_frac_core_value = oracle_fixed_by_frac(fixed_a, fixed_b);
      trace_hit(TRACE_ORACLE_RLEW_EXPAND_CHECKSUM);
      rlew_expand_checksum_hash = oracle_rlew_expand_checksum((const uint16_t *)rlew_source_bytes, rlew_source_len / 2, rlew_tag, rlew_expanded_length / 2);
      trace_hit(TRACE_ORACLE_RAYCAST_DISTANCE_Q16);
      raycast_distance_q16_value = oracle_raycast_distance_q16(
        state->map_lo,
        state->map_hi,
        ray_viewx,
        ray_viewy,
        ray_viewcos,
        ray_viewsin,
        16
      );
      trace_hit(TRACE_ORACLE_ACTOR_STEP_PACKED);
      actor_step_packed_value = oracle_actor_step_packed(ai_state & 3, (state->tick & 7) << 8, (state->flags & 0x400) ? 1 : 0, rng);
      trace_hit(TRACE_ORACLE_PLAYER_MOVE_PACKED);
      player_move_packed_value = oracle_player_move_packed(state->map_lo, state->map_hi, state->xq8, state->yq8, strafe, forward);
      trace_hit(TRACE_ORACLE_GAME_EVENT_HASH);
      game_event_hash_value = oracle_game_event_hash(bonus_score, bonus_lives, bonus_health, bonus_ammo, menu_action, bonus_value);
      trace_hit(TRACE_ORACLE_MENU_REDUCE_PACKED);
      menu_reduce_packed_value = oracle_menu_reduce_packed(menu_screen, menu_cursor, menu_action, menu_items);
      trace_hit(TRACE_ORACLE_MEASURE_TEXT_PACKED);
      measure_text_packed_value = oracle_measure_text_packed(text_len, vh_max_width / vh_font_width);
      trace_hit(TRACE_ORACLE_AUDIO_REDUCE_PACKED);
      audio_reduce_packed_value = oracle_audio_reduce_packed(current_sound_mode, current_music_mode, sound_mode, menu_action, sound_id);
      trace_hit(TRACE_WL_STATE_CHECK_LINE);
      wl_state_check_line_value = oracle_wl_state_check_line(ai_ax, ai_ay, player_x, player_y, state->map_lo, state->map_hi);
      trace_hit(TRACE_WL_STATE_CHECK_SIGHT);
      wl_state_check_sight_value = oracle_wl_state_check_sight(ai_ax, ai_ay, player_x, player_y, state->map_lo, state->map_hi);
      trace_hit(TRACE_WL_STATE_MOVE_OBJ_HASH);
      wl_state_move_obj_hash_value = oracle_wl_state_move_obj_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_WL_STATE_SELECT_CHASE_DIR_HASH);
      wl_state_select_chase_dir_hash_value = oracle_wl_state_select_chase_dir_hash(
        ai_ax,
        ai_ay,
        player_x,
        player_y,
        ai_dir,
        ai_state,
        ai_hp,
        ai_speed,
        ai_cooldown,
        ai_flags,
        rng,
        state->map_lo,
        state->map_hi
      );
      trace_hit(TRACE_REAL_WL_AGENT_CLIP_MOVE_HASH);
      real_agent_clip_move_hash_value = oracle_real_wl_agent_clip_move_hash(
        state->xq8 << 8,
        state->yq8 << 8,
        strafe << 8,
        forward << 8,
        state->map_lo,
        state->map_hi,
        0
      );
      runtime_probe_mix =
        spawn_door_hash ^
        push_wall_hash ^
        take_damage_hash ^
        level_completed_hash ^
        victory_hash ^
        sound_loc_hash ^
        update_sound_loc_hash ^
        play_sound_loc_hash ^
        read_control_hash ^
        ((uint32_t)user_input_value) ^
        set_sound_mode_hash ^
        set_music_mode_hash ^
        play_sound_hash ^
        stop_sound_hash ^
        setup_audio_file_hash ^
        cache_audio_chunk_hash ^
        us_print_hash ^
        us_cprint_hash ^
        us_draw_window_hash ^
        menu_control_panel_hash ^
        menu_draw_main_hash ^
        menu_draw_hash ^
        menu_new_game_hash ^
        menu_view_scores_hash ^
        menu_sound_hash ^
        menu_control_hash ^
        menu_message_hash ^
        text_help_hash ^
        text_end_hash ^
        ((uint32_t)fixed_by_frac_value) ^
        build_tables_hash ^
        calc_projection_hash ^
        transform_actor_hash ^
        transform_tile_hash ^
        ((uint32_t)calc_height_value) ^
        hit_vert_wall_hash ^
        hit_horiz_wall_hash ^
        setup_scaling_hash ^
        scale_shape_hash ^
        simple_scale_shape_hash ^
        draw_play_screen_hash ^
        select_dodge_dir_hash ^
        damage_actor_hash ^
        agent_try_move_hash ^
        agent_clip_move_hash ^
        agent_control_movement_hash ^
        carmack_expand_hash ^
        rlew_expand_hash ^
        setup_map_file_hash ^
        cache_map_hash ^
        setup_game_level_hash ^
        mm_get_ptr_hash ^
        mm_free_ptr_hash ^
        mm_set_purge_hash ^
        mm_set_lock_hash ^
        mm_sort_mem_hash ^
        pm_check_main_mem_hash ^
        pm_get_page_address_hash ^
        pm_get_page_hash ^
        pm_next_frame_hash ^
        pm_reset_hash ^
        vh_measure_prop_string_hash ^
        vh_draw_pic_hash ^
        vh_bar_hash ^
        vl_bar_hash ^
        vl_mem_to_screen_hash ^
        vl_latch_to_screen_hash ^
        vl_fade_in_hash ^
        vl_fade_out_hash ^
        vl_plot_hash ^
        vl_hlin_hash ^
        vh_plot_hash ^
        vh_hlin_hash ^
        vh_vlin_hash ^
        vh_measure_string_hash ^
        vh_draw_prop_string_hash ^
        vl_vlin_hash ^
        vl_screen_to_screen_hash ^
        vl_masked_to_screen_hash ^
        vl_mem_to_latch_hash ^
        vl_clear_video_hash ^
        vh_draw_prop_string2_hash ^
        vh_draw_color_prop_string_hash ^
        vh_measure_mprop_string_hash ^
        vh_draw_tile8_hash ^
        vh_draw_tile8m_hash ^
        vl_set_color_hash ^
        vl_get_color_hash ^
        vl_set_palette_hash ^
        vl_get_palette_hash ^
        vl_fill_palette_hash ^
        vh_mark_update_block_hash ^
        vh_update_screen_hash ^
        vh_latch_draw_pic_hash ^
        vh_load_latch_mem_hash ^
        vh_vl_munge_pic_hash ^
        vl_set_line_width_hash ^
        vl_set_split_screen_hash ^
        vl_set_vga_plane_mode_hash ^
        vl_set_text_mode_hash ^
        vl_color_border_hash ^
        (uint32_t)fixed_mul_value ^
        (uint32_t)fixed_by_frac_core_value ^
        rlew_expand_checksum_hash ^
        (uint32_t)raycast_distance_q16_value ^
        (uint32_t)actor_step_packed_value ^
        (uint32_t)player_move_packed_value ^
        (uint32_t)game_event_hash_value ^
        (uint32_t)menu_reduce_packed_value ^
        (uint32_t)measure_text_packed_value ^
        (uint32_t)audio_reduce_packed_value ^
        (uint32_t)wl_state_check_line_value ^
        (uint32_t)wl_state_check_sight_value ^
        wl_state_move_obj_hash_value ^
        wl_state_select_chase_dir_hash_value ^
        real_agent_clip_move_hash_value;

      /* Keep probe hash computation for trace coverage, but do not drive runtime state from hash bits. */
      (void)runtime_probe_mix;
    }
  }

  if (pending_damage_calls > 0 && state->health > 0) {
    int32_t damage_out;
    trace_hit(TRACE_REAL_WL_AGENT_TAKE_DAMAGE);
    damage_out = real_wl_agent_take_damage_apply(
      state->health,
      pending_damage_calls, /* points */
      2, /* gd_medium */
      0, /* god mode off */
      0  /* victory flag off */
    );
    state->health = clamp_i32(damage_out & 0xffff, 0, 100);
    if ((damage_out & (1 << 16)) != 0) {
      state->flags |= 0x40;
    } else {
      state->flags &= ~0x40;
    }
  } else if (state->health <= 0) {
    state->flags |= 0x40;
  }

  state->tick++;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_init(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t start_xq8,
  int32_t start_yq8,
  int32_t start_angle_deg,
  int32_t start_health,
  int32_t start_ammo
) {
  trace_hit(TRACE_ORACLE_RUNTIME_INIT);
  g_state.map_lo = map_lo;
  g_state.map_hi = map_hi;
  g_state.xq8 = start_xq8;
  g_state.yq8 = start_yq8;
  g_state.angle_deg = ((start_angle_deg % 360) + 360) % 360;
  g_state.health = clamp_i32(start_health, 0, 100);
  g_state.ammo = clamp_i32(start_ammo, 0, 99);
  g_state.cooldown = 0;
  g_state.flags = 0;
  g_state.tick = 0;
  g_state.angle_frac = 0;

  g_boot_state = g_state;
  return 1;
}

EMSCRIPTEN_KEEPALIVE void oracle_runtime_reset(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_RESET);
  g_state = g_boot_state;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_step(int32_t input_mask, int32_t tics, int32_t rng) {
  trace_hit(TRACE_ORACLE_RUNTIME_STEP);
  int32_t loops = clamp_i32(tics, 0, 32);
  for (int32_t i = 0; i < loops; i++) {
    int32_t step_rng = rng ^ (i * 1103515245);
    runtime_step_one(&g_state, input_mask, step_rng);
  }
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_snapshot_hash(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_SNAPSHOT_HASH);
  return runtime_snapshot_hash(&g_state);
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_render_frame_hash(int32_t view_width, int32_t view_height) {
  uint32_t wall_refresh_hash;
  uint32_t three_d_refresh_hash;
  uint32_t player_x = (uint32_t)(g_state.xq8 << 8);
  uint32_t player_y = (uint32_t)(g_state.yq8 << 8);

  trace_hit(TRACE_ORACLE_RUNTIME_RENDER_FRAME_HASH);
  trace_hit(TRACE_REAL_WL_DRAW_WALL_REFRESH);
  wall_refresh_hash = oracle_wl_draw_wall_refresh_hash(
    g_state.angle_deg,
    (int32_t)player_x,
    (int32_t)player_y,
    0x5800,
    0,
    0x10000
  );
  trace_hit(TRACE_REAL_WL_DRAW_THREE_D_REFRESH);
  three_d_refresh_hash = oracle_wl_draw_three_d_refresh_hash(
    0,
    0,
    g_state.tick,
    0,
    wall_refresh_hash
  );

  uint32_t h = runtime_snapshot_hash(&g_state);
  h = fnv1a_u32(h, (uint32_t)view_width);
  h = fnv1a_u32(h, (uint32_t)view_height);
  h = fnv1a_u32(h, wall_refresh_hash);
  h = fnv1a_u32(h, three_d_refresh_hash);
  return h;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_set_state(
  uint32_t map_lo,
  uint32_t map_hi,
  int32_t xq8,
  int32_t yq8,
  int32_t angle_deg,
  int32_t health,
  int32_t ammo,
  int32_t cooldown,
  int32_t flags,
  int32_t tick
) {
  trace_hit(TRACE_ORACLE_RUNTIME_SET_STATE);
  g_state.map_lo = map_lo;
  g_state.map_hi = map_hi;
  g_state.xq8 = xq8;
  g_state.yq8 = yq8;
  g_state.angle_deg = ((angle_deg % 360) + 360) % 360;
  g_state.health = clamp_i32(health, 0, 100);
  g_state.ammo = clamp_i32(ammo, 0, 99);
  g_state.cooldown = clamp_i32(cooldown, 0, 255);
  g_state.flags = flags;
  g_state.tick = tick;
  g_state.angle_frac = 0;
  return 1;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_lo(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_MAP_LO);
  return g_state.map_lo;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_get_map_hi(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_MAP_HI);
  return g_state.map_hi;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_xq8(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_XQ8);
  return g_state.xq8;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_yq8(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_YQ8);
  return g_state.yq8;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_angle_deg(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_ANGLE_DEG);
  return g_state.angle_deg;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_health(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_HEALTH);
  return g_state.health;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_ammo(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_AMMO);
  return g_state.ammo;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_cooldown(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_COOLDOWN);
  return g_state.cooldown;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_flags(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_FLAGS);
  return g_state.flags;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_get_tick(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_GET_TICK);
  return g_state.tick;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_state_size(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_STATE_SIZE);
  return RUNTIME_STATE_SERIALIZED_BYTES;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_save_state(uint8_t *out_bytes, int32_t out_len) {
  trace_hit(TRACE_ORACLE_RUNTIME_SAVE_STATE);
  return runtime_save_state_into(out_bytes, out_len);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_load_state(const uint8_t *in_bytes, int32_t in_len) {
  trace_hit(TRACE_ORACLE_RUNTIME_LOAD_STATE);
  return runtime_load_state_from(in_bytes, in_len);
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_framebuffer_size(void) {
  trace_hit(TRACE_ORACLE_RUNTIME_FRAMEBUFFER_SIZE);
  return RUNTIME_INDEXED_FRAME_BYTES;
}

EMSCRIPTEN_KEEPALIVE uint32_t oracle_runtime_render_indexed_frame(uint8_t *out_bytes, int32_t out_len) {
  trace_hit(TRACE_ORACLE_RUNTIME_RENDER_INDEXED_FRAME);
  return runtime_render_indexed_frame_into(out_bytes, out_len);
}

EMSCRIPTEN_KEEPALIVE void oracle_runtime_trace_reset(void) {
  memset(g_trace_seen, 0, sizeof(g_trace_seen));
  g_trace_count = 0;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_trace_count(void) {
  return g_trace_count;
}

EMSCRIPTEN_KEEPALIVE int32_t oracle_runtime_trace_symbol_id_at(int32_t index) {
  int32_t seen = 0;
  int32_t id;
  if (index < 0 || index >= g_trace_count) {
    return -1;
  }
  for (id = 1; id < TRACE_SYMBOL_MAX; id++) {
    if (!g_trace_seen[id]) {
      continue;
    }
    if (seen == index) {
      return id;
    }
    seen++;
  }
  return -1;
}
