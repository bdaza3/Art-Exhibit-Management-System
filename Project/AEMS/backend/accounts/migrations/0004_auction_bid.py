from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_artwork_alter_customuser_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='artwork',
            name='status',
            field=models.CharField(choices=[('available', 'Available'), ('sold', 'Sold'), ('in_auction', 'In Auction')], default='available', max_length=20),
        ),
        migrations.CreateModel(
            name='Auction',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('start_time', models.DateTimeField()),
                ('end_time', models.DateTimeField()),
                ('starting_bid', models.FloatField(default=0)),
                ('min_increment', models.FloatField(default=1)),
                ('status', models.CharField(choices=[('scheduled', 'Scheduled'), ('active', 'Active'), ('paused', 'Paused'), ('cancelled', 'Cancelled'), ('ended', 'Ended')], default='scheduled', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('artwork', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='auctions', to='accounts.artwork')),
            ],
        ),
        migrations.CreateModel(
            name='Bid',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.FloatField()),
                ('anonymous', models.BooleanField(default=False)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
                ('auction', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bids', to='accounts.auction')),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='accounts.customuser')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
    ]
