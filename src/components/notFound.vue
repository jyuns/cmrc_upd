<template>
  <v-main>
        <v-container class="fill-height" fluid>
        <v-row
          align="center"
          justify="center"
        >
        <v-col class='text-center'>
        * 404 error 존재하지 않는 페이지입니다 *
        </v-col>
        </v-row>
        <v-row>
        <v-col class='text-center'>
        <router-link to='/'>
        홈 화면으로 돌아가기
        </router-link>
        </v-col>
        </v-row>
        </v-container>
  </v-main>
</template>

<script>
export default {
    name : 'notFound',

}
</script>

<style>

</style>