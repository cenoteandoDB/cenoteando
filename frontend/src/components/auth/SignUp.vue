<template>
    <v-container class="justify-center p-10">
        <form>
            <v-text-field
                v-model="name"
                :error-messages="nameErrors"
                label="Name"
                required
                @input="$v.name.$touch()"
                @blur="$v.name.$touch()"
            ></v-text-field>

            <v-text-field
                v-model="email"
                :error-messages="emailErrors"
                label="E-mail"
                required
                @input="$v.email.$touch()"
                @blur="$v.email.$touch()"
            ></v-text-field>

            <v-text-field
                v-model="password"
                :error-messages="passwordErrors"
                :counter="10"
                label="Password"
                required
                @input="$v.password.$touch()"
                @blur="$v.password.$touch()"
            ></v-text-field>

            <v-btn class="mr-4" @click="submit" color="primary">
                Sign Up
            </v-btn>
            <v-btn color="primary" @click="clear"> clear </v-btn>
        </form>
    </v-container>
</template>

<script>
import { validationMixin } from 'vuelidate';
import { required, maxLength, email } from 'vuelidate/lib/validators';

export default {
    mixins: [validationMixin],

    validations: {
        name: { required, maxLength },
        password: { required },
        email: { required, email },
        select: { required },
    },

    data: () => ({
        name: '',
        email: '',
        password: '',
        select: null,
    }),

    computed: {
        nameErrors() {
            const errors = [];
            if (!this.$v.name.$dirty) return;
            errors;
            !this.$v.name.required && errors.push('Name is required.');
            return errors;
        },

        emailErrors() {
            const errors = [];
            if (!this.$v.email.$dirty) return errors;
            !this.$v.email.email && errors.push('Must be valid e-mail');
            !this.$v.email.required && errors.push('E-mail is required');
            return errors;
        },

        passwordErrors() {
            const errors = [];
            if (!this.$v.password.$dirty) return errors;

            !this.$v.password.required && errors.push('Password is required.');
            return errors;
        },
    },

    methods: {
        submit() {
            this.$v.$touch();
        },
        clear() {
            this.$v.$reset();
            this.password = '';
            this.email = '';
            this.name = '';
        },
    },
};
</script>
