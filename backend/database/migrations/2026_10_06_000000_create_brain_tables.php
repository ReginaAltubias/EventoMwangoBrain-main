<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            Schema::table('users', function (Blueprint $table) {
                if (!Schema::hasColumn('users', 'role')) {
                    $table->string('role')->default('Comercial');
                }
                if (!Schema::hasColumn('users', 'initials')) {
                    $table->string('initials')->default('US');
                }
                if (!Schema::hasColumn('users', 'status')) {
                    $table->string('status')->default('Aprovado');
                }
            });
        }
        Schema::dropIfExists('brain_users');

        Schema::create('solution_items', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('name')->unique();
            $table->string('subtitle');
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('full_name');
            $table->string('company');
            $table->string('role')->nullable();
            $table->string('phone');
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('sector')->nullable();
            $table->string('org_type')->nullable();
            $table->text('notes')->nullable();
            $table->string('source');
            $table->boolean('is_complete')->default(false);
            $table->string('created_by');
            $table->timestamps();
        });

        Schema::create('leads', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('contact_id');
            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('cascade');
            $table->json('solutions');
            $table->string('main_solution');
            $table->text('need')->nullable();
            $table->string('has_concrete_need');
            $table->string('timeframe')->nullable();
            $table->string('interest');
            $table->string('status');
            $table->string('owner_id');
            $table->string('next_action');
            $table->dateTime('follow_up_date')->nullable();
            $table->text('notes')->nullable();
            $table->bigInteger('estimated_value')->nullable();
            $table->timestamps();
        });

        Schema::create('interactions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('lead_id');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->string('type');
            $table->text('description');
            $table->dateTime('date');
            $table->string('user_id');
            $table->timestamps();
        });

        Schema::create('follow_ups', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('lead_id');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->string('action');
            $table->dateTime('due_date');
            $table->string('owner_id');
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('meetings', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('lead_id');
            $table->foreign('lead_id')->references('id')->on('leads')->onDelete('cascade');
            $table->string('type');
            $table->dateTime('start');
            $table->dateTime('end');
            $table->string('owner_id');
            $table->string('location')->nullable();
            $table->timestamps();
        });

        Schema::create('visitor_feedbacks', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('contact_id')->nullable();
            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('set null');
            $table->integer('overall');
            $table->integer('team');
            $table->integer('presentation');
            $table->integer('relevance');
            $table->json('highlights');
            $table->string('wants_solution')->nullable();
            $table->boolean('wants_contact')->default(false);
            $table->text('comment')->nullable();
            $table->timestamps();
        });

        Schema::create('notifications', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->string('title');
            $table->string('detail');
            $table->string('date');
            $table->boolean('read')->default(false);
            $table->string('href');
            $table->timestamps();
        });

        Schema::create('internal_evaluations', function (Blueprint $table) {
            $table->id();
            $table->json('scores');
            $table->text('went_well')->nullable();
            $table->text('difficulties')->nullable();
            $table->json('top_solutions');
            $table->text('main_needs')->nullable();
            $table->text('improvements')->nullable();
            $table->dateTime('saved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internal_evaluations');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('visitor_feedbacks');
        Schema::dropIfExists('meetings');
        Schema::dropIfExists('follow_ups');
        Schema::dropIfExists('interactions');
        Schema::dropIfExists('leads');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('solution_items');
        Schema::dropIfExists('brain_users');
    }
};
