<template>
    <v-card>
        <v-form ref="form">
            <v-text-field
                v-model="name"
                id="name"
                name="name"
                :rules="nameRules"
                type="text"
                label="Name"
                required
            ></v-text-field>

            <v-text-field
                v-model="email"
                id="email"
                name="email"
                :rules="emailRules"
                type="text"
                label="E-mail"
                required
            ></v-text-field>

            <v-text-field
                v-model="password"
                id="current-password"
                name="current-password"
                :rules="passwordRules"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                required
                @click:append="showPassword = !showPassword"
            ></v-text-field>

            <v-card-actions>
                <v-btn
                    :disabled="!this.validate()"
                    data-cy="submit"
                    @click="submit"
                    color="primary"
                >
                    SIGN UP
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn to="/login" text> LOG IN </v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class SignupCard extends Vue {
    name = '';
    nameRules = [(v: string): string | true => !!v || 'Name is required'];

    email = '';
    emailRules = [
        (v: string): string | true => !!v || 'E-mail is required',
        (v: string): string | true =>
            /.+@.+\..+/.test(v) || 'E-mail must be valid',
    ];

    password = '';
    passwordRules = [
        (v: string): string | true => !!v || 'Password is required',
        (v: string): string | true =>
            (v && v.length >= 8) || 'Password must have at least 8 characters',
    ];
    showPassword = false;

    submit(): void {
        this.$emit('onSubmit', this.name, this.email, this.password);
    }

    validate(): boolean {
        let res = this.nameRules
            .map((rule) => rule(this.name))
            .every((res) => res === true);
        res &&= this.emailRules
            .map((rule) => rule(this.email))
            .every((res) => res === true);
        res &&= this.passwordRules
            .map((rule) => rule(this.password))
            .every((res) => res === true);
        return res;
    }
}
</script>

<style scoped lang="scss">
.v-card {
    width: 300px;
    margin: 32px auto;
    padding: 16px;
}
</style>
